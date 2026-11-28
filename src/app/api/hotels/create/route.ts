import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema=z.object({
  name:z.string().trim().min(2).max(150),
  city:z.string().trim().max(100).optional().default(""),
  country:z.enum(["FR","CH"]),
  language:z.enum(["fr","en","it","de","es"])
});

function makeSlug(value:string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,55) || "hotel";
}

export async function POST(request:Request) {
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Vérifiez les informations de l'établissement."},{status:400});

  const supabase=await createClient();
  const {data:claims,error:authError}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(authError||typeof userId!=="string") return NextResponse.json({error:"Connectez-vous avant de créer votre établissement."},{status:401});

  const {data:existingMembership,error:membershipLookupError}=await supabase
    .from("hotel_members").select("hotel_id").eq("user_id",userId).limit(1).maybeSingle();
  if(membershipLookupError) {
    console.error("HospitIA onboarding membership lookup failed:",membershipLookupError.code||"database_error");
    return NextResponse.json({error:"Impossible de vérifier les accès du compte. Réessayez."},{status:500});
  }
  if(existingMembership) return NextResponse.json({error:"Un établissement est déjà associé à ce compte."},{status:409});

  // Recover a hotel created by an earlier interrupted onboarding attempt instead of duplicating it.
  const {data:orphanHotel,error:ownerLookupError}=await supabase.from("hotels")
    .select("id").eq("owner_user_id",userId).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(ownerLookupError) {
    console.error("HospitIA onboarding owner lookup failed:",ownerLookupError.code||"database_error");
    return NextResponse.json({error:"Impossible de retrouver votre établissement. Réessayez."},{status:500});
  }

  let hotelId:string;
  if(orphanHotel) {
    const {error:linkError}=await supabase.from("hotel_members").insert({
      hotel_id:orphanHotel.id,user_id:userId,role:"owner"
    });
    if(linkError) {
      console.error("HospitIA onboarding recovery failed:",linkError.code||"database_error");
      return NextResponse.json({error:"Le rattachement de votre établissement a échoué. Réessayez sans recréer un hôtel."},{status:500});
    }
    hotelId=orphanHotel.id;
  } else {
    const value=parsed.data;
    const suffix=crypto.randomUUID().slice(0,8);
    const {data,error:createError}=await supabase.rpc("create_hotel_with_owner",{
      p_name:value.name,
      p_slug:`${makeSlug(value.name)}-${suffix}`,
      p_city:value.city||"",
      p_country:value.country,
      p_language:value.language
    });
    if(createError||typeof data!=="string") {
      console.error("HospitIA atomic onboarding failed:",createError?.code||"invalid_rpc_result");
      const conflict=createError?.code==="23505";
      return NextResponse.json(
        {error:conflict?"Un établissement est déjà associé à ce compte. Actualisez la page.":"Impossible de créer votre établissement. Vérifiez les informations et réessayez."},
        {status:conflict?409:500}
      );
    }
    hotelId=data;
  }

  const response=NextResponse.json({ok:true,hotelId});
  response.cookies.set("hospitia_active_hotel",hotelId,{
    httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*30
  });
  return response;
}

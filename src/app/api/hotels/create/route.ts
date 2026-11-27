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

  const {data:existing}=await supabase.from("hotel_members").select("hotel_id").eq("user_id",userId).limit(1).maybeSingle();
  if(existing) return NextResponse.json({error:"Un établissement est déjà associé à ce compte."},{status:409});

  const suffix=crypto.randomUUID().slice(0,8);
  const value=parsed.data;
  const {data:hotel,error:createError}=await supabase.from("hotels").insert({
    name:value.name,
    slug:`${makeSlug(value.name)}-${suffix}`,
    city:value.city||null,
    country:value.country,
    language:value.language,
    plan:"starter",
    owner_user_id:userId
  }).select("id").single();

  if(createError||!hotel) {
    console.error("HospitIA onboarding hotel insert failed:",createError?.code||"database_error");
    return NextResponse.json({error:"Impossible de créer l'établissement. Réessayez."},{status:500});
  }

  const {error:membershipError}=await supabase.from("hotel_members").insert({
    hotel_id:hotel.id,
    user_id:userId,
    role:"owner"
  });

  if(membershipError) {
    console.error("HospitIA onboarding membership insert failed:",membershipError.code||"database_error");
    return NextResponse.json({error:"L'hôtel a été créé, mais le rattachement de votre compte a échoué. Contactez le support HospitIA."},{status:500});
  }

  const response=NextResponse.json({ok:true,hotelId:hotel.id});
  response.cookies.set("hospitia_active_hotel",hotel.id,{
    httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*30
  });
  return response;
}

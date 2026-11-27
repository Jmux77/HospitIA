import { createClient } from "@/lib/supabase/server";
export async function getUserAndHotel(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return {supabase,user:null,hotelId:null};
 const {data:membership}=await supabase.from("hotel_members").select("hotel_id,role").eq("user_id",user.id).maybeSingle();
 return {supabase,user,hotelId:membership?.hotel_id??null};
}
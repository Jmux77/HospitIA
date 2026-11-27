import OpenAI from "openai";
const openai=process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;
type Fact={category:string;question:string;answer:string};
export async function answerGuest(question:string,hotel:{name:string;language:string;facts:Fact[]},language="fr"){
 if(!openai)throw new Error("OPENAI_API_KEY_MISSING");
 const knowledge=hotel.facts.map(f=>`- ${f.category}: ${f.question} => ${f.answer}`).join("\n");
 const result=await openai.chat.completions.create({
  model:process.env.OPENAI_MODEL||"gpt-4o-mini",temperature:0.2,
  messages:[
   {role:"system",content:`Tu es le concierge virtuel de ${hotel.name}. Réponds dans la langue ${language||hotel.language||"fr"}. Utilise uniquement les informations vérifiées ci-dessous. N'invente jamais horaires, prix, disponibilités, politiques ou équipements. Si l'information manque, indique que la réception doit confirmer. Ne demande jamais de données bancaires ou pièces d'identité. Informations validées:\n${knowledge}`},
   {role:"user",content:question}
  ]
 });
 return result.choices[0]?.message?.content||"La réception pourra vous renseigner.";
}
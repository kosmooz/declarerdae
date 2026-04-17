"use client";
import { useState } from "react";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import PageHero from "@/components/declarerdae/PageHero";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message envoyé avec succès !");
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Contact" }]} />
      <PageHero
        tag="Nous contacter"
        title="Une question ? Notre équipe est à votre écoute"
        description="Besoin d'aide pour déclarer votre DAE, comprendre vos obligations ou obtenir un devis ? Contactez-nous et nous vous répondrons sous 24h."
        showCTA={false}
      />

      <main>
        <section className="bg-[#F6F6F6] py-10 sm:py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
              {/* Coordonnées */}
              <div className="lg:col-span-1">
                <ScrollReveal>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="font-heading font-bold text-lg text-[#161616] mb-4">
                        Nos coordonnées
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#EFF6FF] shrink-0">
                            <Mail className="w-4 h-4 text-[#000091]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-sm text-[#161616]">Email</p>
                            <p className="text-sm text-[#666]">contact@declarerdefibrillateur.fr</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#EFF6FF] shrink-0">
                            <Phone className="w-4 h-4 text-[#000091]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-sm text-[#161616]">Téléphone</p>
                            <p className="text-sm text-[#666]">01 23 45 67 89</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#EFF6FF] shrink-0">
                            <Clock className="w-4 h-4 text-[#000091]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-sm text-[#161616]">Horaires</p>
                            <p className="text-sm text-[#666]">Lun - Ven : 9h - 18h</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#EFF6FF] shrink-0">
                            <MapPin className="w-4 h-4 text-[#000091]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-sm text-[#161616]">Adresse</p>
                            <p className="text-sm text-[#666]">Paris, France</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded p-4">
                      <p className="text-sm text-[#1E40AF] leading-relaxed">
                        <strong>Délai de réponse :</strong> Nous nous engageons à répondre à toutes les demandes sous 24 heures ouvrées.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Formulaire */}
              <div className="lg:col-span-2">
                <ScrollReveal delay={200}>
                  {submitted ? (
                    <div className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-6 lg:p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F0FDF4] mb-4">
                        <CheckCircle2 className="w-8 h-8 text-[#18753C]" />
                      </div>
                      <h3 className="font-heading font-bold text-xl text-[#161616] mb-2">
                        Message envoyé avec succès
                      </h3>
                      <p className="text-sm text-[#666] mb-4 max-w-md mx-auto">
                        Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais, sous 24 heures ouvrées maximum.
                      </p>
                      <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="border-[#000091] text-[#000091] hover:bg-[#EFF6FF] bg-transparent"
                      >
                        Envoyer un autre message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-6 space-y-4">
                      <h2 className="font-heading font-bold text-lg text-[#161616] mb-2">
                        Envoyez-nous un message
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact-nom" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Nom *</Label>
                          <Input id="contact-nom" required placeholder="Votre nom" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
                        </div>
                        <div>
                          <Label htmlFor="contact-prenom" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Prénom *</Label>
                          <Input id="contact-prenom" required placeholder="Votre prénom" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact-email" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Email *</Label>
                          <Input id="contact-email" type="email" required placeholder="votre@email.fr" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
                        </div>
                        <div>
                          <Label htmlFor="contact-tel" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Téléphone</Label>
                          <Input id="contact-tel" type="tel" placeholder="01 23 45 67 89" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Objet de votre demande *</Label>
                        <Select required>
                          <SelectTrigger className="border-[#CECECE] focus:border-[#000091]">
                            <SelectValue placeholder="Sélectionnez un objet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="declaration">Aide à la déclaration</SelectItem>
                            <SelectItem value="obligations">Question sur les obligations</SelectItem>
                            <SelectItem value="devis">Demande de devis collectivité</SelectItem>
                            <SelectItem value="technique">Question technique</SelectItem>
                            <SelectItem value="partenariat">Partenariat</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="contact-message" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Message *</Label>
                        <Textarea
                          id="contact-message"
                          required
                          rows={5}
                          placeholder="Décrivez votre demande en détail..."
                          className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091] resize-none"
                        />
                      </div>

                      <Button type="submit" className="bg-[#000091] hover:bg-[#000070] text-white font-semibold px-6">
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer mon message
                      </Button>
                    </form>
                  )}
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
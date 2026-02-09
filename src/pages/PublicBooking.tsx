import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalIcon, Check, Clock, DollarSign, User, Phone, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, parse, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  interval_minutes: number;
}

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<{ id: string; name: string } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<AvailableHour[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [existingAppointments, setExistingAppointments] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data: prof } = await supabase.from("profiles").select("id, name").eq("slug", slug).single();
      if (!prof) { setNotFound(true); return; }
      setProfile(prof);
      const { data: svc } = await supabase.from("services").select("id, name, duration_minutes, price").eq("professional_id", prof.id).eq("active", true);
      if (svc) setServices(svc);
      const { data: hrs } = await supabase.from("available_hours").select("day_of_week, start_time, end_time, interval_minutes").eq("professional_id", prof.id).eq("active", true);
      if (hrs) setHours(hrs);
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (!profile || !selectedDate) return;
    const loadExisting = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("professional_id", profile.id)
        .eq("appointment_date", dateStr)
        .in("status", ["pending", "confirmed"]);
      if (data) setExistingAppointments(data.map((a) => a.appointment_time));
    };
    loadExisting();
  }, [profile, selectedDate]);

  const availableSlots = (): string[] => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    const dayHours = hours.filter((h) => h.day_of_week === dow);
    const slots: string[] = [];
    for (const h of dayHours) {
      const start = parse(h.start_time, "HH:mm:ss", new Date());
      const end = parse(h.end_time, "HH:mm:ss", new Date());
      let current = start;
      while (isBefore(current, end)) {
        const timeStr = format(current, "HH:mm:ss");
        if (!existingAppointments.includes(timeStr)) {
          slots.push(timeStr);
        }
        current = addMinutes(current, h.interval_minutes);
      }
    }
    return slots;
  };

  const isDateDisabled = (date: Date) => {
    const dow = date.getDay();
    return !hours.some((h) => h.day_of_week === dow);
  };

  const handleBook = async () => {
    if (!profile || !selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) return;
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      professional_id: profile.id,
      service_id: selectedService,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
    });
    setLoading(false);
    if (error) return;
    setSuccess(true);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="p-8">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <CalIcon className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-xl font-bold text-foreground">Profissional não encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">Verifique o link e tente novamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
        <Card className="w-full max-w-md text-center shadow-xl border-2 border-primary/20">
          <CardContent className="p-10">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Agendamento enviado!</h2>
            <p className="text-muted-foreground">
              {profile?.name} vai confirmar seu horário em breve.
            </p>
            <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Fique de olho no seu WhatsApp!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const slots = availableSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Profissional */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <CalIcon className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl text-primary">AgendaFácil</span>
            </div>
            {profile && (
              <>
                <h1 className="text-3xl font-extrabold text-foreground mb-2">
                  {profile.name}
                </h1>
                <p className="text-muted-foreground">
                  Escolha o serviço e o horário ideal para você
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 1: Service */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Passo 1</Badge>
              <CardTitle className="text-lg">Escolha o serviço</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                  selectedService === s.id 
                    ? "border-primary bg-primary/10 shadow-md" 
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">{s.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {s.duration_minutes} min
                      </span>
                      <span className="text-sm font-medium text-primary flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {Number(s.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {selectedService === s.id && (
                    <Check className="h-6 w-6 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Step 2: Date */}
        {selectedService && (
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Passo 2</Badge>
                <CardTitle className="text-lg">Escolha a data</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                disabled={(date) => date < new Date(new Date().toDateString()) || isDateDisabled(date)}
                locale={ptBR}
                className="rounded-lg border"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Time */}
        {selectedDate && (
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Passo 3</Badge>
                <CardTitle className="text-lg">Escolha o horário</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum horário disponível nesta data.</p>
                  <p className="text-xs text-muted-foreground mt-1">Escolha outra data</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((t) => (
                    <Button
                      key={t}
                      size="lg"
                      variant={selectedTime === t ? "default" : "outline"}
                      onClick={() => setSelectedTime(t)}
                      className={`font-semibold ${selectedTime === t ? 'shadow-md' : ''}`}
                    >
                      {t.slice(0, 5)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Client info */}
        {selectedTime && (
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Passo 4</Badge>
                <CardTitle className="text-lg">Confirme seus dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumo do agendamento */}
              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Resumo do agendamento</p>
                {selectedServiceData && (
                  <>
                    <p className="font-semibold text-foreground">{selectedServiceData.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedServiceData.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {Number(selectedServiceData.price).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {format(selectedDate!, "EEEE, dd/MM/yyyy 'às' ", { locale: ptBR })}
                      <span className="font-semibold text-primary">{selectedTime.slice(0, 5)}</span>
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cname" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Seu nome completo
                  </Label>
                  <Input 
                    id="cname" 
                    placeholder="Digite seu nome" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cphone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    WhatsApp
                  </Label>
                  <Input 
                    id="cphone" 
                    placeholder="(11) 99999-9999" 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)} 
                    required 
                    className="h-12"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 text-base font-semibold shadow-lg" 
                onClick={handleBook} 
                disabled={loading || !clientName.trim() || !clientPhone.trim()}
                size="lg"
              >
                {loading ? "Enviando..." : "Confirmar agendamento"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao confirmar, você receberá uma mensagem no WhatsApp
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            Powered by <span className="font-semibold text-primary">AgendaFácil</span>
          </p>
        </div>
      </div>
    </div>
  );
}

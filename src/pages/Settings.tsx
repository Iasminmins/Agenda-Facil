import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const dayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  active: boolean;
}

interface AvailableHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  interval_minutes: number;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<AvailableHour[]>([]);
  const [newService, setNewService] = useState({ name: "", duration_minutes: 30, price: 0 });
  const [newHour, setNewHour] = useState({ day_of_week: 1, start_time: "08:00", end_time: "18:00", interval_minutes: 30 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from("profiles").select("id, slug").eq("user_id", user.id).single();
      if (profile) {
        setProfileId(profile.id);
        setSlug(profile.slug || "");
        const { data: svc } = await supabase.from("services").select("*").eq("professional_id", profile.id);
        if (svc) setServices(svc);
        const { data: hrs } = await supabase.from("available_hours").select("*").eq("professional_id", profile.id).order("day_of_week");
        if (hrs) setHours(hrs);
      }
    };
    load();
  }, [user]);

  const addService = async () => {
    if (!profileId || !newService.name) return;
    const { data, error } = await supabase.from("services").insert({ ...newService, professional_id: profileId }).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    if (data) setServices([...services, data]);
    setNewService({ name: "", duration_minutes: 30, price: 0 });
  };

  const removeService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    setServices(services.filter((s) => s.id !== id));
  };

  const addHour = async () => {
    if (!profileId) return;
    const { data, error } = await supabase.from("available_hours").insert({ ...newHour, professional_id: profileId }).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    if (data) setHours([...hours, data]);
  };

  const removeHour = async (id: string) => {
    await supabase.from("available_hours").delete().eq("id", id);
    setHours(hours.filter((h) => h.id !== id));
  };

  const bookingUrl = slug ? `${window.location.origin}/agendar/${slug}` : "";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>

        {/* Booking link */}
        {slug && (
          <Card>
            <CardContent className="p-5">
              <Label className="text-sm text-muted-foreground">Seu link de agendamento:</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input value={bookingUrl} readOnly className="text-sm" />
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(bookingUrl); toast({ title: "Link copiado!" }); }}>
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.duration_minutes}min · R${Number(s.price).toFixed(2)}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeService(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="service-name" className="text-sm font-medium">Nome do serviço</Label>
                <Input id="service-name" placeholder="Ex: Corte de cabelo" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-duration" className="text-sm font-medium">Duração (minutos)</Label>
                <Input id="service-duration" type="number" placeholder="30" value={newService.duration_minutes} onChange={(e) => setNewService({ ...newService, duration_minutes: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price" className="text-sm font-medium">Valor (R$)</Label>
                <Input id="service-price" type="number" step="0.01" placeholder="50.00" value={newService.price} onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })} />
              </div>
            </div>
            <Button onClick={addService} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar serviço
            </Button>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Horários disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hours.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div>
                  <Badge variant="outline" className="mr-2">{dayLabels[h.day_of_week]}</Badge>
                  <span className="text-sm text-foreground">{h.start_time.slice(0, 5)} - {h.end_time.slice(0, 5)}</span>
                  <span className="text-sm text-muted-foreground ml-2">({h.interval_minutes}min intervalo)</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeHour(h.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newHour.day_of_week} onChange={(e) => setNewHour({ ...newHour, day_of_week: Number(e.target.value) })}>
                {dayLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <Input type="time" value={newHour.start_time} onChange={(e) => setNewHour({ ...newHour, start_time: e.target.value })} />
              <Input type="time" value={newHour.end_time} onChange={(e) => setNewHour({ ...newHour, end_time: e.target.value })} />
              <Input type="number" placeholder="Intervalo (min)" value={newHour.interval_minutes} onChange={(e) => setNewHour({ ...newHour, interval_minutes: Number(e.target.value) })} />
            </div>
            <Button onClick={addHour} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar horário
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

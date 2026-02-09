
-- Make the public insert policy more restrictive: require valid professional and service
DROP POLICY "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create appointments with valid data" ON public.appointments 
  FOR INSERT WITH CHECK (
    professional_id IN (SELECT id FROM public.profiles) AND
    service_id IN (SELECT id FROM public.services WHERE active = true)
  );

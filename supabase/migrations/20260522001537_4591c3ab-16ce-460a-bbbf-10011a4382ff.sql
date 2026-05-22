-- V4 rollback: feature newsletter retirée (aucun signup en 2+ jours).
-- Drop de la table email_subscribers et de ses indexes.
-- Aucun risque de perte de données vu que la table est vide.

DROP TABLE IF EXISTS public.email_subscribers CASCADE;
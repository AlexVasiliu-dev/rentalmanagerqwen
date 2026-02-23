export const translations = {
  ro: {
    // Auth
    'autentificare': 'Autentificare',
    'inregistrare': 'Înregistrare',
    'email': 'Email',
    'parola': 'Parolă',
    'nume': 'Nume',
    'conecteaza': 'Conectează-te',
    'deconectare': 'Deconectare',
    'nu_ai_cont': 'Nu ai cont?',
    'ai_deja_cont': 'Ai deja cont?',
    'inregistreaza': 'Înregistrează-te',
    
    // Navigation
    'dashboard': 'Dashboard',
    'proprietati': 'Proprietăți',
    'contracte': 'Contracte',
    'citiri_contoare': 'Citiri Contoare',
    'facturi': 'Facturi',
    'rapoarte': 'Rapoarte',
    'abonament': 'Abonament',
    'setari': 'Setări',
    
    // Property
    'proprietate': 'Proprietate',
    'adresa': 'Adresă',
    'oras': 'Oraș',
    'pret': 'Preț',
    'mp': 'mp',
    'camere': 'Camere',
    'disponibil': 'Disponibil',
    'ocupat': 'Ocupat',
    'adauga_proprietate': 'Adaugă Proprietate',
    
    // Meter Readings
    'citire': 'Citire',
    'contor': 'Contor',
    'energie': 'Energie Electrică',
    'apa': 'Apă',
    'gaz': 'Gaz',
    'fotografiaza_contor': 'Fotografiază Contorul',
    'citire_initiala': 'Citire Inițială',
    'citire_lunara': 'Citire Lunară',
    'citire_finala': 'Citire Finală',
    'submitere_citire': 'Submitere Citire',
    
    // Bills
    'factura': 'Factură',
    'suma': 'Sumă',
    'platit': 'Plătit',
    'neplatit': 'Neplătit',
    'data_scadenta': 'Data Scadență',
    'plateste': 'Plătește',
    
    // Common
    'salveaza': 'Salvează',
    'anuleaza': 'Anulează',
    'sterge': 'Șterge',
    'editeaza': 'Editează',
    'incarca': 'Încarcă',
    'se_incarca': 'Se încarcă...',
    'eroare': 'Eroare',
    'succes': 'Succes',
    'inapoi': 'Înapoi',
    'cauta': 'Caută',
    'filtreaza': 'Filtrează',
    
    // Subscription
    'abonamentul_tau': 'Abonamentul Tău',
    'proprietati_acoperite': 'Proprietăți Acoperite',
    'upgrade': 'Upgrade',
    'pret_per_an': 'preț/an',
    'bogo_offer': 'Cumperi 1, Primești 2 Gratuito',
  },
};

export type TranslationKey = keyof typeof translations.ro;

export const t = (key: TranslationKey): string => {
  return translations.ro[key] || key;
};

export default translations;

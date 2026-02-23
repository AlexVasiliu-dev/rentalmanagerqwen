interface ContractData {
  owner: {
    name: string | null
    companyName: string | null
    companyRegNumber: string | null
    companyFiscalCode: string | null
    workingEmail: string | null
    phone: string | null
  }
  tenant: {
    name: string | null
    email: string
    phone: string | null
    idCardSeries: string | null
    idCardNumber: string | null
    cnp: string | null
  }
  property: {
    address: string
    city: string
    country: string
    type: string
    sqm: number
    rooms: number | null
    floor: number | null
  }
  lease: {
    startDate: string
    endDate: string | null
    monthlyRent: number
    deposit: number | null
    paymentDay: number
  }
  signatures: {
    ownerSigned: boolean
    ownerSignedAt: string | null
    tenantSigned: boolean
    tenantSignedAt: string | null
  }
}

export function generateLeaseContractRo(data: ContractData): string {
  const contractDate = new Date().toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const startDate = new Date(data.lease.startDate).toLocaleDateString('ro-RO')
  const endDate = data.lease.endDate 
    ? new Date(data.lease.endDate).toLocaleDateString('ro-RO')
    : 'nedeterminată'

  const ownerSignedDate = data.signatures.ownerSigned && data.signatures.ownerSignedAt 
    ? new Date(data.signatures.ownerSignedAt).toLocaleDateString('ro-RO')
    : null
    
  const tenantSignedDate = data.signatures.tenantSigned && data.signatures.tenantSignedAt 
    ? new Date(data.signatures.tenantSignedAt).toLocaleDateString('ro-RO')
    : null

  return `
CONTRACT DE ÎNCHIRIERE

Încheiat astăzi ${contractDate}

I. PĂRȚILE CONTRACTANTE

1. ${data.owner.companyName || data.owner.name || 'PROPRIETAR'}, cu sediul în România, 
   ${data.owner.companyRegNumber ? `înregistrată la Registrul Comerțului sub nr. ${data.owner.companyRegNumber},` : ''}
   ${data.owner.companyFiscalCode ? `CIF ${data.owner.companyFiscalCode},` : ''}
   reprezentată prin ${data.owner.name || 'administrator'}, 
   Email: ${data.owner.workingEmail || data.owner.email || 'N/A'}
   Telefon: ${data.owner.phone || 'N/A'}
   denumită în continuare "PROPRIETAR"

   ȘI

2. ${data.tenant.name || 'CHIRIAȘ'}, 
   ${data.tenant.idCardSeries && data.tenant.idCardNumber ? `având CI seria ${data.tenant.idCardSeries} nr. ${data.tenant.idCardNumber},` : ''}
   ${data.tenant.cnp ? `CNP ${data.tenant.cnp},` : ''}
   Email: ${data.tenant.email}
   ${data.tenant.phone ? `Telefon: ${data.tenant.phone}` : ''}
   denumit în continuare "CHIRIAȘ"

II. OBIECTUL CONTRACTULUI

Art. 1 - Proprietatea
Proprietarul închiriază Chiriașului imobilul situat la:
   Adresa: ${data.property.address}, ${data.property.city}, ${data.property.country}
   Tip: ${data.property.type}
   Suprafață: ${data.property.sqm} mp
   ${data.property.rooms ? `Camere: ${data.property.rooms}` : ''}
   ${data.property.floor ? `Etaj: ${data.property.floor}` : ''}

Art. 2 - Destinația
Imobilul va fi folosit exclusiv pentru locuință, fără drept de subînchiriere.

III. DURATA CONTRACTULUI

Art. 3 - Perioada
Contractul se încheie pe perioada ${startDate} până la ${endDate}.

IV. PREȚUL ȘI MODALITATEA DE PLATĂ

Art. 4 - Chiria Lunară
Chiria lunară este de ${data.lease.monthlyRent} RON, plătibilă până în data de ${data.lease.paymentDay} a fiecărei luni.

Art. 5 - Garanția
Garanția este de ${data.lease.deposit || data.lease.monthlyRent} RON și va fi returnată la sfârșitul contractului, 
dacă nu există daune sau datorii.

Art. 6 - Utilitățile
Utilitățile (apă, gaz, energie electrică, internet) sunt în sarcina Chiriașului și se plătesc separat.

V. OBLIGAȚIILE PĂRȚILOR

Art. 7 - Obligațiile Proprietarului
a) Să predea imobilul în bună stare Chiriașului
b) Să efectueze reparațiile majore necesare
c) Să respecte liniștea și intimitatea Chiriașului

Art. 8 - Obligațiile Chiriașului
a) Să plătească chiria la termenul convenit
b) Să folosească imobilul cu bună-cuință
c) Să permită accesul Proprietarului pentru inspecții (cu anunț prealabil)
d) Să nu facă modificări fără acordul scris al Proprietarului
e) Să plătească utilitățile consumate

VI. ÎNCETAREA CONTRACTULUI

Art. 9 - Rezilierea
Contractul poate fi reziliat:
a) Prin acordul părților
b) De către Proprietar, dacă Chiriașul nu plătește chiria timp de 30 de zile
c) De către Chiriaș, cu preaviz de 30 de zile

VII. DISPOZIȚII FINALE

Art. 10 - Litigii
Orice litigiu se va rezolva pe cale amiabilă, iar în caz contrar, la instanțele competente din România.

Art. 11 - Modificări
Orice modificare a acestui contract trebuie făcută în scris și semnată de ambele părți.

Prezentul contract a fost încheiat în 2 exemplare originale, câte unul pentru fiecare parte.


_________________________          _________________________
PROPRIETAR                          CHIRIAȘ

${ownerSignedDate ? `Semnat la data ${ownerSignedDate}` : 'Semnătura: _______________'}          ${tenantSignedDate ? `Semnat la data ${tenantSignedDate}` : 'Semnătura: _______________'}

Data: ${contractDate}              Data: ${contractDate}
`.trim()
}

export function generateLeaseContractHTML(data: ContractData): string {
  const contractDate = new Date().toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const startDate = new Date(data.lease.startDate).toLocaleDateString('ro-RO')
  const endDate = data.lease.endDate 
    ? new Date(data.lease.endDate).toLocaleDateString('ro-RO')
    : 'nedeterminată'

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contract de Închiriere</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #000;
    }
    h1 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 40px;
    }
    h2 {
      font-size: 18px;
      margin-top: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
    }
    .section {
      margin-bottom: 30px;
    }
    .signature-section {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      border-top: 1px solid #000;
      padding-top: 10px;
    }
    .highlight {
      font-weight: bold;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <h1>CONTRACT DE ÎNCHIRIERE</h1>
  
  <p>Încheiat astăzi <span class="highlight">${contractDate}</span></p>

  <div class="section">
    <h2>I. PĂRȚILE CONTRACTANTE</h2>
    <p><strong>1. ${data.owner.companyName || data.owner.name || 'PROPRIETAR'}</strong>, cu sediul în România, 
    ${data.owner.companyRegNumber ? `înregistrată la Registrul Comerțului sub nr. ${data.owner.companyRegNumber},` : ''}
    ${data.owner.companyFiscalCode ? `CIF ${data.owner.companyFiscalCode},` : ''}
    reprezentată prin ${data.owner.name || 'administrator'}, 
    Email: ${data.owner.workingEmail || data.owner.email || 'N/A'},
    Telefon: ${data.owner.phone || 'N/A'},
    denumită în continuare <strong>"PROPRIETAR"</strong></p>

    <p><strong>ȘI</strong></p>

    <p><strong>2. ${data.tenant.name || 'CHIRIAȘ'}</strong>,
    ${data.tenant.idCardSeries && data.tenant.idCardNumber ? `având CI seria ${data.tenant.idCardSeries} nr. ${data.tenant.idCardNumber},` : ''}
    ${data.tenant.cnp ? `CNP ${data.tenant.cnp},` : ''}
    Email: ${data.tenant.email},
    ${data.tenant.phone ? `Telefon: ${data.tenant.phone}` : ''},
    denumit în continuare <strong>"CHIRIAȘ"</strong></p>
  </div>

  <div class="section">
    <h2>II. OBIECTUL CONTRACTULUI</h2>
    <p><strong>Art. 1 - Proprietatea</strong><br>
    Proprietarul închiriază Chiriașului imobilul situat la:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;Adresa: ${data.property.address}, ${data.property.city}, ${data.property.country}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;Tip: ${data.property.type}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;Suprafață: ${data.property.sqm} mp<br>
    ${data.property.rooms ? `&nbsp;&nbsp;&nbsp;&nbsp;Camere: ${data.property.rooms}<br>` : ''}
    ${data.property.floor ? `&nbsp;&nbsp;&nbsp;&nbsp;Etaj: ${data.property.floor}<br>` : ''}</p>

    <p><strong>Art. 2 - Destinația</strong><br>
    Imobilul va fi folosit exclusiv pentru locuință, fără drept de subînchiriere.</p>
  </div>

  <div class="section">
    <h2>III. DURATA CONTRACTULUI</h2>
    <p><strong>Art. 3 - Perioada</strong><br>
    Contractul se încheie pe perioada <span class="highlight">${startDate}</span> până la <span class="highlight">${endDate}</span>.</p>
  </div>

  <div class="section">
    <h2>IV. PREȚUL ȘI MODALITATEA DE PLATĂ</h2>
    <p><strong>Art. 4 - Chiria Lunară</strong><br>
    Chiria lunară este de <span class="highlight">${data.lease.monthlyRent} RON</span>, plătibilă până în data de ${data.lease.paymentDay} a fiecărei luni.</p>

    <p><strong>Art. 5 - Garanția</strong><br>
    Garanția este de <span class="highlight">${data.lease.deposit || data.lease.monthlyRent} RON</span> și va fi returnată la sfârșitul contractului, dacă nu există daune sau datorii.</p>

    <p><strong>Art. 6 - Utilitățile</strong><br>
    Utilitățile (apă, gaz, energie electrică, internet) sunt în sarcina Chiriașului și se plătesc separat.</p>
  </div>

  <div class="section">
    <h2>V. OBLIGAȚIILE PĂRȚILOR</h2>
    <p><strong>Art. 7 - Obligațiile Proprietarului</strong><br>
    a) Să predea imobilul în bună stare Chiriașului<br>
    b) Să efectueze reparațiile majore necesare<br>
    c) Să respecte liniștea și intimitatea Chiriașului</p>

    <p><strong>Art. 8 - Obligațiile Chiriașului</strong><br>
    a) Să plătească chiria la termenul convenit<br>
    b) Să folosească imobilul cu bună-cuință<br>
    c) Să permită accesul Proprietarului pentru inspecții (cu anunț prealabil)<br>
    d) Să nu facă modificări fără acordul scris al Proprietarului<br>
    e) Să plătească utilitățile consumate</p>
  </div>

  <div class="section">
    <h2>VI. ÎNCETAREA CONTRACTULUI</h2>
    <p><strong>Art. 9 - Rezilierea</strong><br>
    Contractul poate fi reziliat:<br>
    a) Prin acordul părților<br>
    b) De către Proprietar, dacă Chiriașul nu plătește chiria timp de 30 de zile<br>
    c) De către Chiriaș, cu preaviz de 30 de zile</p>
  </div>

  <div class="section">
    <h2>VII. DISPOZIȚII FINALE</h2>
    <p><strong>Art. 10 - Litigii</strong><br>
    Orice litigiu se va rezolva pe cale amiabilă, iar în caz contrar, la instanțele competente din România.</p>

    <p><strong>Art. 11 - Modificări</strong><br>
    Orice modificare a acestui contract trebuie făcută în scris și semnată de ambele părți.</p>
  </div>

  <p style="margin-top: 40px;">Prezentul contract a fost încheiat în 2 exemplare originale, câte unul pentru fiecare parte.</p>

  <div class="signature-section">
    <div class="signature-box">
      <strong>PROPRIETAR</strong><br><br>
      ${ownerSignedDate 
        ? `<span style="color: green;">✓ Semnat la data ${ownerSignedDate}</span>`
        : 'Semnătura: _______________'}<br><br>
      Data: ${contractDate}
    </div>
    <div class="signature-box">
      <strong>CHIRIAȘ</strong><br><br>
      ${tenantSignedDate 
        ? `<span style="color: green;">✓ Semnat la data ${tenantSignedDate}</span>`
        : 'Semnătura: _______________'}<br><br>
      Data: ${contractDate}
    </div>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
`.trim()
}

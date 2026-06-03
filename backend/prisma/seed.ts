import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create regions
  const regions = await Promise.all([
    prisma.region.upsert({
      where: { code: 'CM-AD' },
      update: {},
      create: {
        nameFr: 'Adamaoua',
        nameEn: 'Adamawa',
        code: 'CM-AD',
        monthlyTarget: 80,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-CE' },
      update: {},
      create: {
        nameFr: 'Centre',
        nameEn: 'Centre',
        code: 'CM-CE',
        monthlyTarget: 200,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-ES' },
      update: {},
      create: {
        nameFr: 'Est',
        nameEn: 'East',
        code: 'CM-ES',
        monthlyTarget: 60,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-EN' },
      update: {},
      create: {
        nameFr: 'Extrême-Nord',
        nameEn: 'Far North',
        code: 'CM-EN',
        monthlyTarget: 150,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-LT' },
      update: {},
      create: {
        nameFr: 'Littoral',
        nameEn: 'Littoral',
        code: 'CM-LT',
        monthlyTarget: 180,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-NO' },
      update: {},
      create: {
        nameFr: 'Nord',
        nameEn: 'North',
        code: 'CM-NO',
        monthlyTarget: 100,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-NW' },
      update: {},
      create: {
        nameFr: 'Nord-Ouest',
        nameEn: 'North West',
        code: 'CM-NW',
        monthlyTarget: 90,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-OU' },
      update: {},
      create: {
        nameFr: 'Ouest',
        nameEn: 'West',
        code: 'CM-OU',
        monthlyTarget: 120,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-SU' },
      update: {},
      create: {
        nameFr: 'Sud',
        nameEn: 'South',
        code: 'CM-SU',
        monthlyTarget: 70,
      },
    }),
    prisma.region.upsert({
      where: { code: 'CM-SW' },
      update: {},
      create: {
        nameFr: 'Sud-Ouest',
        nameEn: 'South West',
        code: 'CM-SW',
        monthlyTarget: 85,
      },
    }),
  ]);

  console.log(`✅ Created ${regions.length} regions`);

  // Create users
  const centerRegion = regions.find((r) => r.code === 'CM-CE')!;

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@civicbirth.cm' },
      update: {},
      create: {
        email: 'admin@civicbirth.cm',
        name: 'Admin National',
        passwordHash: await bcrypt.hash('Admin@2026!', 10),
        role: 'NATIONAL_ADMIN',
        regionId: centerRegion.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'officer@civicbirth.cm' },
      update: {},
      create: {
        email: 'officer@civicbirth.cm',
        name: 'Officier Régional',
        passwordHash: await bcrypt.hash('Officer@2026!', 10),
        role: 'REGIONAL_OFFICER',
        regionId: centerRegion.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'registrar@civicbirth.cm' },
      update: {},
      create: {
        email: 'registrar@civicbirth.cm',
        name: 'Officier d\'Etat Civil',
        passwordHash: await bcrypt.hash('Registrar@2026!', 10),
        role: 'MUNICIPAL_REGISTRAR',
        regionId: centerRegion.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'agent@civicbirth.cm' },
      update: {},
      create: {
        email: 'agent@civicbirth.cm',
        name: 'Agent Terrain',
        passwordHash: await bcrypt.hash('Agent@2026!', 10),
        role: 'FIELD_AGENT',
        regionId: centerRegion.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'unicef@civicbirth.cm' },
      update: {},
      create: {
        email: 'unicef@civicbirth.cm',
        name: 'Moniteur UNICEF',
        passwordHash: await bcrypt.hash('Unicef@2026!', 10),
        role: 'UNICEF_MONITOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'worldbank@civicbirth.cm' },
      update: {},
      create: {
        email: 'worldbank@civicbirth.cm',
        name: 'Observateur Banque Mondiale',
        passwordHash: await bcrypt.hash('WorldBank@2026!', 10),
        role: 'WORLD_BANK_OBSERVER',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create agents
  const agentNames = [
    'Kambi Nsangui',
    'Etangeni Mbilé',
    'Mokua Ntang',
    'Samba Ndiaye',
    'Koume Essomba',
    'Nkandu Mwamba',
    'Adeyemi Fatima',
    'Zouhaïr Bennani',
    'Musa Ibrahim',
    'Anaya Diallo',
  ];

  const agents = await Promise.all(
    agentNames.map((name, index) =>
      prisma.agent.upsert({
        where: { agentCode: String(index + 1).padStart(6, '0') },
        update: {},
        create: {
          agentCode: String(index + 1).padStart(6, '0'),
          name,
          phone: `+237${Math.floor(Math.random() * 1000000000)
            .toString()
            .padStart(9, '0')}`,
          regionId: regions[index % regions.length].id,
          district: 'District Central',
          village: 'Village Test',
          unicefCertified: Math.random() > 0.5,
        },
      }),
    ),
  );

  console.log(`✅ Created ${agents.length} agents`);

  // Create sample birth registrations
  const registrations = [];
  const statuses = ['PENDING', 'VALIDATED', 'REJECTED', 'CERTIFICATE_ISSUED'];
  const childNames = [
    'Amara Ndiaye',
    'Fatou Sow',
    'Jean Mvomo',
    'Marie Kenfack',
    'Laurent Essome',
    'Zéphira Ngnie',
    'Brice Awondo',
    'Yasmine Samba',
    'Christophe Ayissi',
    'Awa Mbaye',
  ];
  const motherNames = [
    'Adèle Ndiaye',
    'Brigitte Sow',
    'Cécile Mvomo',
    'Délice Kenfack',
    'Élise Essome',
    'Francine Ngnie',
    'Gabrielle Awondo',
    'Henriette Samba',
    'Isabelle Ayissi',
    'Joëlle Mbaye',
  ];
  const fatherNames = [
    'Abdoulaye Ndiaye',
    'Bassirou Sow',
    'Charles Mvomo',
    'Didier Kenfack',
    'Étienne Essome',
    'François Ngnie',
    'Gérard Awondo',
    'Henri Samba',
    'Ibrahim Ayissi',
    'Jules Mbaye',
  ];

  for (let i = 0; i < 50; i++) {
    const childName = childNames[i % childNames.length];
    const motherName = motherNames[i % motherNames.length];
    const fatherName = fatherNames[i % fatherNames.length];
    const region = regions[i % regions.length];
    const agent = agents[i % agents.length];
    const daysAgo = Math.floor(Math.random() * 180);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const referenceNumber = `CM-2026-${String(i + 1).padStart(7, '0')}`;

    await prisma.birthRegistration.upsert({
      where: { referenceNumber },
      update: {},
      create: {
        referenceNumber,
        childName,
        childSex: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        dob: new Date(
          new Date().getFullYear() - Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        ),
        birthPlace: `${region.nameFr}, Cameroon`,
        regionId: region.id,
        district: 'District ' + (Math.floor(Math.random() * 10) + 1),
        village: `Village ${Math.floor(Math.random() * 100) + 1}`,
        motherName,
        motherPhone: `+237${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, '0')}`,
        fatherName,
        fatherPhone: `+237${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, '0')}`,
        declarantPhone: `+237${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, '0')}`,
        agentId: agent.id,
        channel: ['WEB', 'USSD', 'SMS'][Math.floor(Math.random() * 3)] as any,
        status: status as any,
        validatedById:
          status !== 'PENDING' && status !== 'REJECTED'
            ? users[0].id
            : undefined,
        validatedAt:
          status !== 'PENDING' && status !== 'REJECTED'
            ? createdAt
            : undefined,
        createdAt,
      },
    });
  }

  console.log('✅ Created 50 sample birth registrations');

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const secors = await prisma.sector.createMany({
    data: [
      { name: 'AI/ML' },
      { name: 'Blockchain & Web3' },
      { name: 'Cybersecurity' },
      { name: 'Cloud Computing' },
      { name: 'SaaS' },
      { name: 'Fintech' },
      { name: 'Digital Banking' },
      { name: 'WealthTech' },
      { name: 'Insurtech' },
      { name: 'Lending & Credit Solutions' },
      { name: 'Healthcare' },
      { name: 'Digital Health' },
      { name: 'Biotech' },
      { name: 'Pharmaceuticals' },
      { name: 'Medical Devices & Diagnostics' },
      { name: 'Mental Health & Wellness' },
      { name: 'E-commerce' },
      { name: 'Marketplaces' },
      { name: 'RetailTech' },
      { name: 'Omnichannel Commerce' },
      { name: 'Enterprise Software' },
      { name: 'B2B Saas' },
      { name: 'HR Tech' },
      { name: 'MarTech' },
      { name: 'AdTech' },
      { name: 'Customer Support & CRM Solutions' },
      { name: 'Supply Chain & Procurement Technology' },
      { name: 'Logistics' },
      { name: 'FreightTech' },
      { name: 'Mobility & Transportation' },
      { name: 'EV' },
      { name: 'Autonomous Tech' },
      { name: 'Aerospace' },
      { name: 'SpaceTech' },
      { name: 'Smart Cities & Urban Innovation' },
      { name: 'Renewable Energy' },
      { name: 'Climate Tech' },
      { name: 'Carbon Capture & Sustainability' },
      { name: 'AgriTech' },
      { name: 'FoodTech' },
      { name: 'Water & Environmental Technology' },
      { name: 'PropTech' },
      { name: 'ConstructionTech' },
      { name: 'Media & Digital Content' },
      { name: 'Gaming' },
      { name: 'AR/VR' },
      { name: 'EdTech' },
      { name: 'Remote Work & Collaboration Tools' },
      { name: 'Industrial Automation & Robotics' },
      { name: '3D Printing' },
      { name: 'Advanced Manufacturing' },
      { name: 'Internet of Things (IoT)' },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

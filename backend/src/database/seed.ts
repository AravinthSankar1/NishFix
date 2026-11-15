import { PrismaClient, SoftwareStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed]: Starting comprehensive database seeding...');

  // 1. Create Default Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@repair.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Master Repair Admin',
      role: 'ADMIN',
    },
  });

  console.log(`[Seed]: Admin created/updated: ${admin.email}`);

  // 2. Create Default Demo User with Unlimited / High Multi-Device Quota
  const demoUserPassword = await bcrypt.hash('UserPass123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'technician@repair.local' },
    update: { passwordHash: demoUserPassword, deviceLimit: 10, credits: 500 },
    create: {
      email: 'technician@repair.local',
      passwordHash: demoUserPassword,
      name: 'Pro Technician',
      phone: '+1 234 567 8900',
      deviceLimit: 10,
      credits: 500,
      role: 'USER',
    },
  });
  console.log(`[Seed]: Demo user created/updated: ${user.email}`);

  // 3. Clear existing software entries
  await prisma.downloadLog.deleteMany({});
  await prisma.software.deleteMany({});

  // 4. Comprehensive list of ALL brands matching the user's screenshots
  const ufsBrands = [
    { brand: 'ASUS', cat: 'Dump File', model: 'ROG Phone 7 Ultimate', file: 'DUMP - ASUS ROG Phone 7 Ultimate UFS Dump', size: 16000000000 },
    { brand: 'GOOGLE PIXEL', cat: 'EMMC FILE', model: 'Pixel 8 Pro', file: 'DUMP - Google Pixel 8 Pro Tensor G3 UFS Full Dump', size: 12000000000 },
    { brand: 'HUAWEI', cat: 'Dump File', model: 'P60 Pro', file: 'DUMP - Huawei P60 Pro Kirin UFS Firmware Dump', size: 8500000000 },
    { brand: 'INFINIX', cat: 'File Dump', model: 'Zero 30 5G', file: 'DUMP - Infinix Zero 30 5G Dimensity 8020 UFS Dump', size: 6800000000 },
    { brand: 'IQOO', cat: 'DUMP UFS', model: 'iQOO 12 Pro', file: 'DUMP - iQOO 12 Pro Snapdragon 8 Gen 3 UFS 4.0 Dump', size: 14000000000 },
    { brand: 'ITEL', cat: 'DUMP UFS', model: 'S23 Plus', file: 'DUMP - Itel S23+ Unisoc T616 UFS 2.2 Dump', size: 4500000000 },
    { brand: 'LG', cat: 'DUMP UFS', model: 'Wing / Velvet', file: 'DUMP - LG Velvet 5G Snapdragon UFS Dump', size: 5200000000 },
    { brand: 'MOTOROLA', cat: 'DUMP UFS', model: 'Edge 40 Pro', file: 'DUMP - Motorola Edge 40 Pro UFS 4.0 Firmware Dump', size: 9800000000 },
    { brand: 'NOTHING PHONE', cat: 'DUMP UFS', model: 'Nothing Phone 1', file: 'DUMP - Nothing Phone 1 Android 14 Flash64 Dump File', size: 64000000000 },
    { brand: 'NOTHING PHONE', cat: 'DUMP UFS', model: 'Nothing Phone 2', file: 'DUMP - Nothing Phone 2 Android 14 UFS 3.1 Firmware Dump', size: 128000000000 },
    { brand: 'ONE PLUS', cat: 'DUMP UFS', model: 'OnePlus 11 / 12', file: 'DUMP - OnePlus 11 5G OxygenOS 14 UFS Binary Dump', size: 9800000000 },
    { brand: 'OPPO', cat: 'EMMC FILE', model: 'Find X6 Pro', file: 'DUMP - Oppo Find X6 Pro UFS 4.0 Raw Binary Dump', size: 11500000000 },
    { brand: 'REALME', cat: 'File Dump', model: 'Realme GT 5', file: 'DUMP - Realme GT 5 Snapdragon 8 Gen 2 UFS Dump', size: 8900000000 },
    { brand: 'SAMSUNG', cat: 'File Dump', model: 'Galaxy S23 Ultra', file: 'DUMP - Samsung Galaxy S23 Ultra UFS 4.0 Raw Boot Partitions', size: 8500000000 },
    { brand: 'TCL', cat: 'DUMP UFS', model: '40 NxtPaper', file: 'DUMP - TCL 40 NxtPaper 5G UFS Storage Dump', size: 4200000000 },
    { brand: 'VIVO', cat: 'Dump File', model: 'X100 Pro', file: 'DUMP - Vivo X100 Pro Dimensity 9300 UFS 4.0 Dump', size: 13200000000 },
    { brand: 'XIAOMI', cat: 'File Dump', model: 'Xiaomi 13 Pro', file: 'DUMP - Xiaomi 13 HyperOS UFS Raw Binary Dump', size: 12500000000 },
    { brand: 'ZTE', cat: 'DUMP ZTE - DUMP UFS', model: 'Nubia RedMagic 9', file: 'DUMP - ZTE Nubia RedMagic 9 Pro UFS 4.0 Dump', size: 15400000000 },
  ];

  const mobileBrands = [
    { brand: 'ACER', cat: 'Firmware Acer', model: 'Liquid Z6 Plus', file: 'Acer Liquid Z6 Plus Scatter Stock ROM & Drivers' },
    { brand: 'AG MOBILE', cat: 'Mobile Phone', model: 'Ghost / Chrome', file: 'AG Mobile Ghost Official Stock ROM & SP Flash Tool' },
    { brand: 'ALCATEL', cat: 'Firmware Alcatel', model: '1S / 3L Series', file: 'Alcatel Mobile Upgrade S & Factory Stock Firmware' },
    { brand: 'ASUS', cat: 'Firmware Asus', model: 'Zenfone 10 / ROG', file: 'ASUS Zenfone Official Fastboot RAW Firmware & Flash Tool' },
    { brand: 'BADA', cat: 'Mobile Phone', model: 'Wave Series', file: 'Samsung Bada OS Multiloader Firmware & Drivers Suite' },
    { brand: 'BB MOBILE', cat: 'Mobile Phone', model: 'All Models', file: 'BB Mobile Spreadtrum & MTK Flash Package' },
    { brand: 'BITEL', cat: 'Mobile Phone', model: 'B9501 / B8405', file: 'Bitel Factory Stock Firmware & USB Drivers' },
    { brand: 'BLU', cat: 'Firmware Blu', model: 'G91 Pro / Bold', file: 'BLU Products Official SP Flash Tool Firmware Suite' },
    { brand: 'BRAVIS', cat: 'Mobile Phone', model: 'A504 / NB75', file: 'Bravis MTK Official Scatter ROM & Recovery' },
    { brand: 'BUZZ', cat: 'Mobile Phone', model: 'Buzz Series', file: 'Buzz Mobile Official Scatter Firmware Package' },
    { brand: 'CALLBAR', cat: 'Mobile Phone', model: 'C10 / C20', file: 'Callbar Feature & Smart Phone Flash Package' },
    { brand: 'CALLTOUCH', cat: 'Mobile Phone', model: 'CT Series', file: 'Calltouch Mobile Official Factory Firmware' },
    { brand: 'CELKON', cat: 'Mobile Phone', model: 'Millennia / Campus', file: 'Celkon Official Firmware & Pac Flash Tool' },
    { brand: 'CLOUDFONE', cat: 'Mobile Phone', model: 'Thrill / Excite', file: 'Cloudfone Official Tested Stock Firmware' },
    { brand: 'COOLPAD', cat: 'Mobile Phone', model: 'Cool 20 / Note', file: 'Coolpad Yulong Flashing Tool & Stock ROM' },
    { brand: 'DARK', cat: 'Mobile Phone', model: 'Dark Series', file: 'Dark Mobile Official Firmware & Drivers' },
    { brand: 'ELEPHONE', cat: 'Firmware Elephone', model: 'U Pro / Soldier', file: 'Elephone Official Global Firmware & Flash Tool' },
    { brand: 'FACETEL', cat: 'Mobile Phone', model: 'Q3 / Tab', file: 'Facetel Official Tablet & Phone Stock ROM' },
    { brand: 'FAIRPHONE', cat: 'Mobile Phone', model: 'Fairphone 4 / 5', file: 'Fairphone Official Fastboot Factory Images' },
    { brand: 'GIONEE', cat: 'Firmware Gionee', model: 'M12 / Pioneer', file: 'Gionee GN Flashing Tool & Scatter Stock ROM' },
    { brand: 'GoodOne', cat: 'Mobile Phone', model: 'G Series', file: 'GoodOne Official Firmware & USB Drivers' },
    { brand: 'GOOGLE PIXEL', cat: 'Firmware Pixel', model: 'Pixel 7 / 8 / 9', file: 'Google Pixel Official Factory Fastboot Images' },
    { brand: 'GPLUS', cat: 'Mobile Phone', model: 'Q20 / X10', file: 'GPlus Official Stock Firmware & SP Flash Tool' },
    { brand: 'HOTWAV', cat: 'Firmware Hotwav', model: 'Cyber 9 / W10', file: 'Hotwav Rugged Phone Official Stock Firmware' },
    { brand: 'HTC', cat: 'Firmware Htc', model: 'U23 Pro / Desire', file: 'HTC RUU Official Firmware & Fastboot Tool' },
    { brand: 'HUAWEI', cat: 'Firmware Huawei', model: 'P60 / Nova 11', file: 'Huawei IDT Flash Tool & Board Software Firmware' },
    { brand: 'INFINIX', cat: 'Firmware Infinix', model: 'Note 30 / Hot 40', file: 'Infinix Transsion MDX Official Stock ROM' },
    { brand: 'INFOCUS', cat: 'Mobile Phone', model: 'Vision 3 / M808', file: 'InFocus Official Stock ROM & SP Flash Tool' },
    { brand: 'ITEL', cat: 'Firmware Itel', model: 'P40 / S23', file: 'Itel Official Pac Firmware & SPD Upgrade Tool' },
    { brand: 'LAVA', cat: 'Mobile Phone', model: 'Agni 2 / Yuva 3', file: 'Lava Official Stock Firmware & Flash Tool' },
    { brand: 'LENOVO', cat: 'Firmware Lenovo', model: 'Legion / K14', file: 'Lenovo Rescue and Smart Assistant Firmware' },
    { brand: 'LG', cat: 'Firmware LG', model: 'Velvet / V60', file: 'LG UP Official KDZ Stock Firmware & DLL Suite' },
    { brand: 'MOTOROLA', cat: 'Firmware Moto', model: 'Edge / Moto G', file: 'Motorola Official RSA Factory Firmware & Flasher' },
    { brand: 'NOKIA', cat: 'Mobile Phone', model: 'G42 / C32', file: 'Nokia HMD Official OST Flasher & Stock ROM' },
    { brand: 'NOTHING PHONE', cat: 'Mobile Phone', model: 'Nothing Phone 1 & 2', file: 'Nothing Phone Official EDL Unbrick & Fastboot ROM' },
    { brand: 'ONEPLUS', cat: 'Mobile Phone', model: 'OnePlus 11 / 12', file: 'OnePlus MSM DownloadTool & OxygenOS Fastboot' },
    { brand: 'OPPO', cat: 'Mobile Phone', model: 'Reno 10 / Find X6', file: 'Oppo Official DownloadTool OFP Repair Firmware' },
    { brand: 'REALME', cat: 'Mobile Phone', model: 'Realme 11 / GT', file: 'Realme UI Official Flash Tool & OFP Firmware' },
    { brand: 'SAMSUNG', cat: 'Mobile Phone', model: 'Galaxy A / S / Z', file: 'Samsung Official 4-File Repair Firmware & Odin' },
    { brand: 'VIVO', cat: 'Mobile Phone', model: 'V29 / X100', file: 'Vivo AFTool Official Fastboot & EDL Firmware' },
    { brand: 'XIAOMI', cat: 'Mobile Phone', model: 'Redmi / Poco / Mi', file: 'Xiaomi Mi Flash Pro & Fastboot HyperOS ROM' },
    { brand: 'ZTE', cat: 'Mobile Phone', model: 'Blade / Nubia', file: 'ZTE Factory Flashing Tool & Stock Firmware' },
  ];

  const laptopBrands = [
    { brand: 'ACER', cat: 'Laptop BIOS', model: 'Aspire 7 / Nitro 5', file: 'Acer Nitro 5 LA-L941P Clean ME BIOS & Schematic' },
    { brand: 'APPLE MACBOOK', cat: 'MacBook Boardview', model: 'MacBook Pro M1/M2', file: 'Apple MacBook Pro A2338 820-02020 Schematic & Boardview' },
    { brand: 'ASUS', cat: 'Laptop BIOS', model: 'ZenBook / ROG Zephyrus', file: 'ASUS ROG Zephyrus G14 GA401 Clean BIOS & Boardview' },
    { brand: 'DELL', cat: 'Laptop Schematic', model: 'Inspiron 15 3511', file: 'Dell Inspiron 3511 LA-L241P Clean BIOS & Schematic' },
    { brand: 'HP', cat: 'Laptop BIOS', model: 'Pavilion 15-BW series', file: 'HP pavilion 15-BW series LA-E841P Rev 2.0 Clean BIOS' },
    { brand: 'LENOVO', cat: 'Laptop BIOS', model: 'ThinkPad X1 Yoga', file: 'LENOVO ThinkPad X1 Yoga 5th Gen (NM-C881) Clean BIOS' },
    { brand: 'MSI', cat: 'Laptop BIOS', model: 'Katana / Stealth', file: 'MSI Katana GF66 MS-1581 Boardview & Clear ME BIOS' },
    { brand: 'SAMSUNG', cat: 'Laptop BIOS', model: 'Galaxy Book 3', file: 'Samsung Galaxy Book NP750 Clean BIOS Dump' },
    { brand: 'TOSHIBA', cat: 'Laptop BIOS', model: 'Dynabook Tecra', file: 'Toshiba Dynabook Satellite Pro Clean BIOS & Boardview' },
  ];

  const emmcBrands = [
    { brand: 'ASUS', cat: 'EMMC FILE', model: 'Max Pro M1 / M2', file: 'ASUS Zenfone Max Pro M1 eMMC 5.1 Boot Dump' },
    { brand: 'GOOGLE PIXEL', cat: 'EMMC FILE', model: 'Pixel 3a / 4a', file: 'Google Pixel 3a eMMC BGA 221 Partition Dump' },
    { brand: 'HUAWEI', cat: 'EMMC FILE', model: 'Y9 Prime / Nova 3i', file: 'Huawei Y9 Prime eMMC RPMB Clean Partition Dump' },
    { brand: 'INFINIX', cat: 'EMMC FILE', model: 'Hot 10 / Note 8', file: 'Infinix Hot 10 eMMC Userarea & Boot Partitions' },
    { brand: 'ITEL', cat: 'EMMC FILE', model: 'Vision 1 / A48', file: 'Itel Vision 1 Tested eMMC CID & EXT_CSD Dump' },
    { brand: 'LG', cat: 'EMMC FILE', model: 'Stylo 6 / K51', file: 'LG Stylo 6 Tested eMMC 5.1 Boot1 & Boot2 Dump' },
    { brand: 'MOTOROLA', cat: 'EMMC FILE', model: 'Moto G8 Power', file: 'Motorola Moto G8 eMMC BGA 254 Firmware Dump' },
    { brand: 'OPPO', cat: 'EMMC FILE', model: 'A5s / A12 / A3s', file: 'Oppo A5s CPH1909 Tested eMMC Dump & Dead Fix' },
    { brand: 'REALME', cat: 'EMMC FILE', model: 'Realme C2 / C3', file: 'Realme C2 RMX1941 eMMC Userarea Dump 100% Tested' },
    { brand: 'SAMSUNG', cat: 'EMMC FILE', model: 'Galaxy A03 Core / A12', file: 'Samsung A03 Core eMMC CID / Boot1 / Boot2 Dump' },
    { brand: 'VIVO', cat: 'EMMC FILE', model: 'Y11 / Y12 / Y15', file: 'Vivo Y11 1906 100% Tested eMMC Dump for Blank IC' },
    { brand: 'XIAOMI', cat: 'EMMC FILE', model: 'Redmi 9A / 9C', file: 'Redmi 9A (Dandelion) 100% Tested eMMC Firmware Dump' },
  ];

  const specialBrands = [
    { brand: 'QUALCOMM EDL', cat: 'EDL Test Points', model: 'Snapdragon 400 - 8 Gen 3', file: 'Qualcomm EDL 9008 Test Points & Firehose Loader Collection' },
    { brand: 'MEDIATEK BROM', cat: 'BROM Bypass', model: 'Helio & Dimensity', file: 'MediaTek SLA / DAA Auto-Bypass Service Utility Suite' },
    { brand: 'BORNEO BITMAPS', cat: 'Schematics & Bitmaps', model: 'Samsung / iPhone / Xiaomi', file: 'Smartwatch & Smartphone Diode Value Hardware Bitmaps' },
    { brand: 'FRP TOOLS', cat: 'Account Bypass', model: 'Android 11 - 15', file: 'Universal Android FRP / Knox / MDM Direct Bypass Toolkit' },
  ];

  const pcBrands = [
    { brand: 'ASUS', cat: 'PC Motherboard BIOS', model: 'PRIME / ROG STRIX', file: 'ASUS PRIME & ROG Desktop Motherboard BIOS & Boardview Suite' },
    { brand: 'GIGABYTE', cat: 'PC Motherboard BIOS', model: 'AORUS / Ultra Durable', file: 'Gigabyte AORUS Desktop Motherboard Clean BIOS & Boardview' },
    { brand: 'MSI', cat: 'PC Motherboard BIOS', model: 'MAG / PRO Series', file: 'MSI MAG B650 / Z790 Motherboard Verified Clear BIOS' },
    { brand: 'ASROCK', cat: 'PC Motherboard BIOS', model: 'Phantom Gaming / Steel Legend', file: 'ASRock Steel Legend Desktop Motherboard BIOS & Schematics' },
  ];

  let totalSeeded = 0;

  // Insert UFS Brands
  for (const item of ufsBrands) {
    await prisma.software.create({
      data: {
        brand: item.brand,
        model: item.model,
        softwareName: item.file,
        version: 'v2026 Update',
        description: `Tested ${item.brand} ${item.model} firmware and dump archive. Lab tested 100% working.`,
        category: item.cat,
        subCategory: 'UFS FILE',
        uploaderName: item.brand === 'NOTHING PHONE' ? 'HYD ANAS' : 'Pro Technician',
        originalFileName: `${item.brand.replace(/\s+/g, '-')}-${item.model.replace(/\s+/g, '-')}.zip`,
        fileObjectKey: `ufs/${item.brand.toLowerCase()}.zip`,
        fileSize: BigInt(item.size),
        externalUrl: 'https://drive.google.com/file/d/1CNewNenowwu1xPzEZQw2xFLr48eCwtViE/view',
        downloadCount: Math.floor(Math.random() * 800) + 200,
        status: SoftwareStatus.PUBLISHED,
      },
    });
    totalSeeded++;
  }

  // Insert Mobile Brands
  for (const item of mobileBrands) {
    await prisma.software.create({
      data: {
        brand: item.brand,
        model: item.model,
        softwareName: item.file,
        version: 'v1.0 / Stock',
        description: `Tested factory signed firmware package for ${item.brand} ${item.model}.`,
        category: item.cat,
        subCategory: 'Mobile Phone',
        uploaderName: 'Official Lab',
        originalFileName: `${item.brand.replace(/\s+/g, '-')}-Official-Firmware.zip`,
        fileObjectKey: `mobile/${item.brand.toLowerCase()}.zip`,
        fileSize: BigInt(3500000000),
        externalUrl: 'https://drive.google.com/drive/folders/testedfile-mobile-mirror',
        downloadCount: Math.floor(Math.random() * 500) + 100,
        status: SoftwareStatus.PUBLISHED,
      },
    });
    totalSeeded++;
  }

  // Insert Laptop Brands
  for (const item of laptopBrands) {
    await prisma.software.create({
      data: {
        brand: item.brand,
        model: item.model,
        softwareName: item.file,
        version: 'Clear ME / Rev 2.0',
        description: `Verified working motherboard BIOS dump and CAD boardview schematic for ${item.brand} ${item.model}.`,
        category: item.cat,
        subCategory: 'Laptop',
        uploaderName: 'HYD ANAS',
        originalFileName: `${item.brand.replace(/\s+/g, '-')}-Laptop-BIOS.zip`,
        fileObjectKey: `laptop/${item.brand.toLowerCase()}.zip`,
        fileSize: BigInt(32000000),
        externalUrl: 'https://drive.google.com/drive/folders/testedfile-laptop-mirror',
        downloadCount: Math.floor(Math.random() * 600) + 150,
        status: SoftwareStatus.PUBLISHED,
      },
    });
    totalSeeded++;
  }

  // Insert eMMC Brands
  for (const item of emmcBrands) {
    await prisma.software.create({
      data: {
        brand: item.brand,
        model: item.model,
        softwareName: item.file,
        version: 'eMMC 5.1 / CID Tested',
        description: `Complete eMMC memory partition binary dump for ${item.brand} ${item.model}. Fixes dead phone.`,
        category: item.cat,
        subCategory: 'EMMC FILE',
        uploaderName: 'Pro Technician',
        originalFileName: `${item.brand.replace(/\s+/g, '-')}-eMMC-Dump.zip`,
        fileObjectKey: `emmc/${item.brand.toLowerCase()}.zip`,
        fileSize: BigInt(4500000000),
        externalUrl: 'https://drive.google.com/drive/folders/testedfile-emmc-mirror',
        downloadCount: Math.floor(Math.random() * 700) + 300,
        status: SoftwareStatus.PUBLISHED,
      },
    });
    totalSeeded++;
  }

  // Insert Special Brands
  for (const item of specialBrands) {
    await prisma.software.create({
      data: {
        brand: item.brand,
        model: item.model,
        softwareName: item.file,
        version: '2026 Collection',
        description: `Hardware diagnostic utility and test points for ${item.brand}.`,
        category: item.cat,
        subCategory: 'SPECIAL FILE',
        uploaderName: 'Master Repair Admin',
        originalFileName: `${item.brand.replace(/\s+/g, '-')}-Collection.zip`,
        fileObjectKey: `special/${item.brand.toLowerCase()}.zip`,
        fileSize: BigInt(1200000000),
        externalUrl: 'https://drive.google.com/drive/folders/testedfile-special-mirror',
        downloadCount: Math.floor(Math.random() * 1500) + 500,
        status: SoftwareStatus.PUBLISHED,
      },
    });
    totalSeeded++;
  }

  // Insert PC Brands
  for (const item of pcBrands) {
    await prisma.software.create({
      data: {
        brand: item.brand,
        model: item.model,
        softwareName: item.file,
        version: 'Cap / Bin Rev 1.0',
        description: `Verified desktop motherboard BIOS binary files (.CAP and .BIN) and Boardview schematics.`,
        category: item.cat,
        subCategory: 'PC',
        uploaderName: 'Official Lab',
        originalFileName: `${item.brand.replace(/\s+/g, '-')}-Desktop-BIOS.zip`,
        fileObjectKey: `pc/${item.brand.toLowerCase()}.zip`,
        fileSize: BigInt(650000000),
        externalUrl: 'https://drive.google.com/drive/folders/testedfile-pc-mirror',
        downloadCount: Math.floor(Math.random() * 400) + 100,
        status: SoftwareStatus.PUBLISHED,
      },
    });
    totalSeeded++;
  }

  console.log(`[Seed]: Successfully populated ALL ${totalSeeded} brands across all Borneo DataWorks categories!`);
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

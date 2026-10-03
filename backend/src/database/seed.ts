import { PrismaClient, SoftwareStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed]: Starting database seeding...');

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

  // 2. Clear existing software entries if needed
  await prisma.downloadLog.deleteMany({});
  await prisma.software.deleteMany({});

  // 3. Create Sample Mobile Repair Software Entries
  const sampleSoftware = [
    {
      brand: 'Samsung',
      model: 'Galaxy A15 / S23 / A54',
      softwareName: 'Samsung Odin Flash Tool & Repair Driver Suite',
      version: 'v3.14.4',
      description: 'Official ROM flashing tool for Samsung Galaxy smartphones. Supports 4-file repair firmware (BL, AP, CP, CSC), pit repartitioning, and brick recovery for One UI 6.0 / Android 14.',
      additionalInfo: 'Requires Samsung USB Drivers v1.7.59. Compatible with Windows 10/11 x64.',
      category: 'Firmware & Flashing',
      tags: 'Odin, Samsung, Firmware, Flashing, Unbrick',
      compatibility: 'Android 10 - 14, Exynos & Snapdragon chipsets',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-samsung/image/samsung-thumb.webp',
      fileObjectKey: 'software/seed-samsung/files/Samsung-Odin-v3.14.4-Repair-Suite.zip',
      originalFileName: 'Samsung-Odin-v3.14.4-Repair-Suite.zip',
      fileSize: BigInt(2540000000), // 2.54 GB
      mimeType: 'application/zip',
      externalUrl: 'https://developer.samsung.com/galaxy/others/android-usb-driver-for-windows',
      downloadCount: 1420,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Xiaomi',
      model: 'Redmi Note 13 / Poco X6 / Mi 13',
      softwareName: 'Xiaomi Mi Flash Tool Pro & Fastboot Utility',
      version: 'v2023.04.14',
      description: 'Official Xiaomi Fastboot & EDL flashing software. Solves bootloop issues, removes screen lock, updates HyperOS stock firmware, and restores bricked Snapdragon & MediaTek devices.',
      additionalInfo: 'Requires unlocked bootloader for Fastboot mode or Auth EDL account for test point flashing.',
      category: 'Firmware & Flashing',
      tags: 'Xiaomi, MiFlash, HyperOS, MIUI, EDL, Fastboot',
      compatibility: 'Snapdragon 685 / 7s Gen 2 / Dimensity 6080',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-xiaomi/image/xiaomi-thumb.webp',
      fileObjectKey: 'software/seed-xiaomi/files/Xiaomi-MiFlash-Pro-20230414.zip',
      originalFileName: 'Xiaomi-MiFlash-Pro-20230414.zip',
      fileSize: BigInt(3890000000), // 3.89 GB
      mimeType: 'application/zip',
      externalUrl: 'https://miuirom.org/tools/mi-flash-tool',
      downloadCount: 980,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Apple',
      model: 'iPhone 13 / 14 / 15 Series',
      softwareName: 'Apple iOS DFU Mode Recovery & Repair Toolkit',
      version: 'v17.4.1',
      description: 'Complete repair package for iOS system recovery, DFU mode flashing, iTunes error code resolution (Error 4013, 9, 14), and baseband repair utilities.',
      additionalInfo: 'Includes Apple Mobile Device Driver 2024. Supports IPSW installation for iOS 17.',
      category: 'iOS System Repair',
      tags: 'Apple, iPhone, DFU, Recovery, iOS17, IPSW',
      compatibility: 'iPhone 8 through iPhone 15 Pro Max',
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-apple/image/apple-thumb.webp',
      fileObjectKey: 'software/seed-apple/files/Apple-iOS-DFU-Repair-Toolkit-v17.4.zip',
      originalFileName: 'Apple-iOS-DFU-Repair-Toolkit-v17.4.zip',
      fileSize: BigInt(4920000000), // 4.92 GB
      mimeType: 'application/zip',
      externalUrl: 'https://support.apple.com/en-us/HT201263',
      downloadCount: 2310,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Oppo',
      model: 'Reno 10 / Realme 11 / A78',
      softwareName: 'Oppo & Realme Official DownloadTool Unbrick Suite',
      version: 'v2.1.0',
      description: 'Official service center flashing program for Oppo ColorOS and Realme UI smartphones. Used for dead phone unbricking, pattern unlock bypass, and NVRAM IMEI repair.',
      additionalInfo: 'Run as Administrator. Install MTK & Qualcomm VCOM drivers prior to connection.',
      category: 'Unbrick Tools',
      tags: 'Oppo, Realme, ColorOS, DownloadTool, MTK, Qualcomm',
      compatibility: 'ColorOS 12/13/14, MediaTek & Snapdragon',
      imageUrl: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-oppo/image/oppo-thumb.webp',
      fileObjectKey: 'software/seed-oppo/files/Oppo-Realme-DownloadTool-v2.1.0.zip',
      originalFileName: 'Oppo-Realme-DownloadTool-v2.1.0.zip',
      fileSize: BigInt(3150000000), // 3.15 GB
      mimeType: 'application/zip',
      externalUrl: 'https://drive.google.com/drive/folders/oppo-firmware-mirror',
      downloadCount: 740,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Vivo',
      model: 'Vivo V29 / Y36 / Y17s',
      softwareName: 'Vivo AFTool (AFHost) Official Firmware Flasher',
      version: 'v4.0.8',
      description: 'Official Vivo Fastboot and EDL flashing application. Designed for repairing Funtouch OS boot failure, stuck on logo, and hardware component calibration.',
      additionalInfo: 'Includes USB Drivers and Auth Service patch.',
      category: 'Firmware & Flashing',
      tags: 'Vivo, FuntouchOS, AFTool, Fastboot, Firmware',
      compatibility: 'Funtouch OS 13/14, MediaTek Helio & Snapdragon',
      imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-vivo/image/vivo-thumb.webp',
      fileObjectKey: 'software/seed-vivo/files/Vivo-AFTool-v4.0.8-Flasher.zip',
      originalFileName: 'Vivo-AFTool-v4.0.8-Flasher.zip',
      fileSize: BigInt(2890000000), // 2.89 GB
      mimeType: 'application/zip',
      externalUrl: 'https://drive.google.com/drive/folders/vivo-firmware-mirror',
      downloadCount: 620,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Generic / Chipset',
      model: 'MediaTek MT6768 / MT6877 / MT6983',
      softwareName: 'MediaTek SP Flash Tool & Auto-Bypass Service Utility',
      version: 'v5.2216',
      description: 'Universal MediaTek Smart Phone Flash Tool with SLA/DA BROM Security Bypass. Allows read/write Scatter firmware, format partition, and fix bricked MTK smartphones across all brands.',
      additionalInfo: 'Includes MTK USB All-in-One Drivers v5.1632 and LibUSB Filter 1.2.6.',
      category: 'Chipset Repair Utility',
      tags: 'MediaTek, MTK, SPFlashTool, BROM, Bypass, Scatter',
      compatibility: 'All MediaTek MT6xxx and Dimensity processors',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-mtk/image/mtk-thumb.webp',
      fileObjectKey: 'software/seed-mtk/files/MTK-SP-FlashTool-v5.2216-Bypass.zip',
      originalFileName: 'MTK-SP-FlashTool-v5.2216-Bypass.zip',
      fileSize: BigInt(450000000), // 450 MB
      mimeType: 'application/zip',
      externalUrl: 'https://spflashtools.com/',
      downloadCount: 3150,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Generic / Chipset',
      model: 'Qualcomm Snapdragon Series',
      softwareName: 'Qualcomm QFIL (Qualcomm Flash Image Loader) & QPST Suite',
      version: 'v2.7.496',
      description: 'Official Qualcomm emergency download (EDL Mode 9008) raw program loader. Flash XML rawprogram0.xml and patch0.xml files to restore dead Qualcomm Android phones.',
      additionalInfo: 'Requires Qualcomm HS-USB QDLoader 9008 Driver v2.1.2.2.',
      category: 'Chipset Repair Utility',
      tags: 'Qualcomm, QFIL, QPST, EDL, 9008, Snapdragon',
      compatibility: 'Snapdragon 400 through Snapdragon 8 Gen 3',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-qualcomm/image/qualcomm-thumb.webp',
      fileObjectKey: 'software/seed-qualcomm/files/Qualcomm-QFIL-QPST-v2.7.496.zip',
      originalFileName: 'Qualcomm-QFIL-QPST-v2.7.496.zip',
      fileSize: BigInt(680000000), // 680 MB
      mimeType: 'application/zip',
      externalUrl: 'https://qfiltool.com/',
      downloadCount: 2890,
      status: SoftwareStatus.PUBLISHED,
    },
    {
      brand: 'Motorola',
      model: 'Moto G Series / Edge 40',
      softwareName: 'Motorola Rescue and Smart Assistant (RSA)',
      version: 'v6.8.2',
      description: 'Official Lenovo Motorola software repair, ROM flashing, hardware diagnostics, and rescue tool for all Moto smartphones and tablets.',
      additionalInfo: 'Supports automatic serial detection and firmware download directly from Lenovo servers.',
      category: 'Firmware & Flashing',
      tags: 'Motorola, Moto, RSA, Rescue, Diagnostics',
      compatibility: 'Moto G, Moto E, Moto Edge, Razr series',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
      imageObjectKey: 'software/seed-moto/image/moto-thumb.webp',
      fileObjectKey: 'software/seed-moto/files/Motorola-Rescue-Smart-Assistant-v6.8.2.zip',
      originalFileName: 'Motorola-Rescue-Smart-Assistant-v6.8.2.zip',
      fileSize: BigInt(1850000000), // 1.85 GB
      mimeType: 'application/zip',
      externalUrl: 'https://support.lenovo.com/us/en/downloads/ds101291',
      downloadCount: 410,
      status: SoftwareStatus.DRAFT,
    },
  ];

  for (const item of sampleSoftware) {
    await prisma.software.create({ data: item });
  }

  console.log(`[Seed]: Created ${sampleSoftware.length} sample mobile software items with external mirror links!`);
  console.log('[Seed]: Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

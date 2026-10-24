CREATE DATABASE  IF NOT EXISTS `fashion_shop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `fashion_shop`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: fashion_shop
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cartitems`
--

DROP TABLE IF EXISTS `cartitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cartId` int NOT NULL,
  `variantId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_variant` (`cartId`,`variantId`),
  KEY `fk_cartitems_variant` (`variantId`),
  CONSTRAINT `fk_cartitems_cart` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cartitems_variant` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_cartitem_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartitems`
--

LOCK TABLES `cartitems` WRITE;
/*!40000 ALTER TABLE `cartitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Thời trang nam','thoi-trang-nam','2026-10-01 21:39:30','2026-10-01 21:39:30'),(2,'Thời trang nữ','thoi-trang-nu','2026-10-01 21:39:30','2026-10-01 21:39:30'),(3,'Thời trang trẻ em','thoi-trang-tre-em','2026-10-01 21:39:30','2026-10-01 21:39:30');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (10,'Be'),(11,'Cam'),(2,'Đen'),(8,'Đỏ'),(14,'Ghi'),(7,'Hồng'),(15,'Nâu'),(12,'Tím'),(1,'Trắng'),(9,'Vàng'),(6,'Xám'),(3,'Xanh'),(4,'Xanh đậm'),(13,'Xanh Navy'),(5,'Xanh nhạt');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_amounts`
--

DROP TABLE IF EXISTS `discount_amounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_amounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `percentage` int NOT NULL DEFAULT '0',
  `amount` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `expiresAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_amounts`
--

LOCK TABLES `discount_amounts` WRITE;
/*!40000 ALTER TABLE `discount_amounts` DISABLE KEYS */;
INSERT INTO `discount_amounts` VALUES (1,'SAVE50',50,0,1,NULL,'2026-10-20 07:27:20','2026-10-20 07:27:20'),(2,'SAVE30',30,0,1,NULL,'2026-10-20 07:27:20','2026-10-20 07:27:20'),(3,'SAVE20',20,0,1,NULL,'2026-10-20 07:27:20','2026-10-20 07:27:20');
/*!40000 ALTER TABLE `discount_amounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `variantId` int NOT NULL,
  `productName` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` int NOT NULL,
  `lineTotal` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `thumbnail` text,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `variantId` (`variantId`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,43,'Áo thun nữ',3,169000,507000,'2026-10-20 08:21:28','2026-10-20 08:21:28',NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `status` enum('pending','confirmed','shipping','delivering','completed','cancelled') NOT NULL DEFAULT 'pending',
  `paymentMethod` enum('cod','stripe') NOT NULL,
  `paymentStatus` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `subtotal` int NOT NULL,
  `discountId` int DEFAULT NULL,
  `discountCode` varchar(255) DEFAULT NULL,
  `discountPercent` int NOT NULL DEFAULT '0',
  `discountAmount` int NOT NULL DEFAULT '0',
  `shippingFee` int NOT NULL DEFAULT '0',
  `total` int NOT NULL,
  `shippingName` varchar(255) NOT NULL,
  `shippingPhone` varchar(255) NOT NULL,
  `shippingAddress` varchar(255) NOT NULL,
  `stripeSessionId` varchar(255) DEFAULT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `cancelReason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stripeSessionId` (`stripeSessionId`),
  KEY `userId` (`userId`),
  KEY `discountId` (`discountId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`discountId`) REFERENCES `discount_amounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,5,'completed','stripe','paid',507000,1,'SAVE50',50,253500,0,253500,'Lam Thu Trang','0877649269','SN 76 Đường Z115 P.Tân Thịnh Tỉnh Thái Nguyên','cs_test_a1EIXFYcJUq8btwsE1o4tLhOOTNKwaw8IINXAjM9hBKcVYfHNkbRFkEi1V',NULL,NULL,'2026-10-20 08:21:28','2026-10-20 08:28:57');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hot` tinyint(1) NOT NULL DEFAULT '0',
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `specs` json DEFAULT NULL,
  `categoryId` int NOT NULL,
  `thumbnail` text COLLATE utf8mb4_unicode_ci,
  `images` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `hidden` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_products_category` (`categoryId`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Áo thun nam basic',1,'ao-thun-nam-basic','Áo thun nam chất liệu cotton 100%, mềm mại và thoáng khí, phù hợp cho mặc hàng ngày.','[\"Chất liệu: 100% cotton\", \"Form áo: Regular fit\", \"Kiểu cổ: Cổ tròn\", \"Thấm hút tốt và không gây bí da\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/d52d7e242fac6dae82288d9a793c0676/t/s/tsn253676._2.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/t/s/tsn253676._1.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/t/s/tsn253676._4.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(2,'Áo sơ mi nam',0,'ao-so-mi-nam','Áo sơ mi nam lịch lãm, dễ dàng phối cùng quần âu hoặc quần jean cho phong cách công sở.','[\"Chất liệu: Cotton pha polyester\", \"Form áo: Slim fit\", \"Cổ áo: Cổ đứng\", \"Dễ giặt và ít nhăn\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/b/ab260047nt_1_1.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/b/ab260047nt_1_1.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/b/ab260047nt-1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(3,'Quần jean nam',0,'quan-jean-nam','Quần jean nam bền và co giãn nhẹ, phù hợp cho mọi hoạt động hàng ngày.','[\"Chất liệu: 98% cotton, 2% elastane\", \"Form: Mid-rise, straight leg\", \"Chi tiết: Co giãn nhẹ, bền màu\", \"Bảo quản: Giặt máy ở nhiệt độ thấp\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/j/qjt263077_1.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/j/qjr258016_1_copy_11zon.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/j/qjr251248._1_1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(4,'Áo len nam',0,'ao-len-nam','Áo len nam giữ ấm nhẹ, phom dáng chuẩn và dễ phối cùng áo sơ mi hoặc áo thun.','[\"Chất liệu: Len pha acrylic\", \"Form: Relaxed fit\", \"Kiểu cổ: Cổ tròn\", \"Phù hợp: Mùa thu đông\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/l/ald231659-grm._90.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/l/ald231658-bl._62.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/l/ald231664._2-2_1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(5,'Áo Polo Classic Men',0,'ao-polo-classic-men','Áo Polo nam cổ điển, chất liệu mềm mại và phom dáng thanh lịch cho mọi dịp.','[\"Chất liệu: Cotton pique\", \"Form: Regular fit\", \"Cổ áo: Polo có cúc\", \"Dễ phối đồ và thoáng mát\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/p/apv262040.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/363cbe3e3c7a6595a5cd38ffb3fa943a/a/p/apv262051_1.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/p/apv261093_3_.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(6,'Áo khoác bomber nam',0,'ao-khoac-bomber-nam','Áo khoác bomber nam mang phong cách trẻ trung và năng động. Chất liệu cao cấp giúp giữ ấm hiệu quả nhưng vẫn đảm bảo sự thoải mái khi vận động. Thiết kế hiện đại dễ phối với quần jean hoặc quần kaki. Phù hợp cho những buổi dạo phố hoặc đi làm.','[\"Chất liệu: Polyester cao cấp\", \"Lót: Vải lót mềm\", \"Kiểu: Zipper trước\", \"Phù hợp: Dạo phố hoặc đi làm\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/j/k/jk256181_1_copy.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/j/k/jk256181_2_copy.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/j/k/jk256181_3_copy.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(7,'Quần kaki nam',0,'quan-kaki-nam','Quần kaki nam đơn giản, dễ phối và mang lại cảm giác thoải mái khi vận động.','[\"Chất liệu: Cotton twill\", \"Form: Straight fit\", \"Cạp: Trung bình\", \"Chi tiết: Túi chéo tiện lợi\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/k/qkr256107_3_copy_11zon.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/k/qkr256107_4_copy_11zon.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/k/qkr256107_1_copy_11zon.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(8,'Áo ghi lê nam',0,'ao-gile-nam','Áo ghi lê nam ấm áp, thoải mái với mũ rút dây và túi trước tiện dụng.','[\"Chất liệu: Cotton fleece\", \"Form: Regular fit\", \"Kiểu: Có mũ, túi kangaroo\", \"Thích hợp: Mặc hàng ngày và dạo phố\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/l/ald241279_11zon.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/l/ald241279-gr._2.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/l/ald241279-gr._3.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(9,'Quần short nam',0,'quan-short-nam','Quần short nam nhẹ nhàng, thoáng mát, thích hợp cho các hoạt động ngoài trời và đi biển.','[\"Chất liệu: Cotton pha polyester\", \"Form: Regular fit\", \"Tính năng: Thấm hút mồ hôi\", \"Chi tiết: Túi hai bên\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/s/t/st261018.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/s/t/st261018-1.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/64b6969b5a751e6599b1523a4893116c/s/t/st261018.4.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(10,'Áo blazer nam',0,'ao-blazer-nam','Áo blazer nam phom chuẩn, giúp tạo vẻ ngoài thanh lịch cho công sở hoặc dạo phố.','[\"Chất liệu: Vải dệt cao cấp\", \"Form: Slim fit\", \"Kiểu: Không tay, cúc trước\", \"Chi tiết: Túi dọc tinh tế\"]',1,'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/b/l/blr2561152_11zon.jpg','[\"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/b/l/blr2561151_11zon.jpg\", \"https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/b/l/blr2561154_11zon.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(11,'Áo thun nữ',1,'ao-thun-nu','Áo thun nữ mềm mại, ôm dáng nhẹ và thích hợp cho mùa hè.','[\"Chất liệu: Cotton modal\", \"Form: Slim fit\", \"Kiểu cổ: Cổ tròn\", \"Mềm mại, thoáng khí\"]',2,'https://sixdo.vn/images/products/2026/original/z7899593367776_0e1856e601d1026f563e1ba79fd61821-1780553880.jpg','[\"https://sixdo.vn/images/products/2026/large/z7899593374170_eda1aec7838f09f7d5fbde361e351afd.jpg\", \"https://sixdo.vn/images/products/2026/large/z7899593371682_3e684f4e7e484a776b62279b872d3fa1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(12,'Váy mùa hè',0,'vay-mua-he','Váy mùa hè nữ nhẹ nhàng, bồng bềnh và tạo cảm giác thoải mái khi mặc trong thời tiết nắng.','[\"Chất liệu: Rayon pha polyester\", \"Form: A-line\", \"Độ dài: Qua gối\", \"Thích hợp: Mùa hè, dạo phố\"]',2,'https://sixdo.vn/images/products/2026/original/vnq05054-copy-1780288431.jpg','[\"https://sixdo.vn/images/products/2026/large/VNQ05069%20copy.jpg\", \"https://sixdo.vn/images/products/2026/large/VNQ05041%20copy.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(13,'Áo sơ mi nữ',0,'ao-so-mi-nu','Áo sơ mi nữ công sở thanh lịch, vải nhẹ và giữ form tốt.','[\"Chất liệu: Chiffon\", \"Form: Relaxed fit\", \"Kiểu cổ: Cổ đức\", \"Dễ giặt, ít nhăn\"]',2,'https://sixdo.vn/images/products/2026/large/_lb_5653-1778815403.jpg','[\"https://sixdo.vn/images/products/2026/large/_1778815386_LB_5591_1.jpg\", \"https://sixdo.vn/images/products/2026/large/_1778815391_LB_5595_1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(14,'Quần áo dài',0,'quan-ao-dai','Quần dài nữ dáng suông, phối hợp linh hoạt trong trang phục hàng ngày.','[\"Chất liệu: Polyester pha cotton\", \"Form: Wide leg\", \"Cạp: Trung bình\", \"Phù hợp: Công sở và hoạt động hằng ngày\"]',2,'https://sixdo.vn/images/products/2025/original/vnq01371-sao-che%CC%81p-1765877816.jpg','[\"https://sixdo.vn/images/products/2025/large/_1765877773VNQ01358%20sao%20che%CC%81p_1.jpg\", \"https://sixdo.vn/images/products/2025/large/_1765877777VNQ01383%20sao%20che%CC%81p_1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(15,'Váy Midi Elegant',0,'vay-midi-elegant','Váy midi nữ thanh lịch, phù hợp cho dạo phố hoặc sự kiện nhẹ nhàng.','[\"Chất liệu: Crepe\", \"Form: Bodycon nhẹ\", \"Độ dài: Midi\", \"Khóa kéo sau lưng\"]',2,'https://sixdo.vn/images/products/2024/large/dsc05406-copy-1727239256.jpg','[\"https://sixdo.vn/images/products/2024/large/_1727239249DSC05412%20copy_1.jpg\", \"https://sixdo.vn/images/products/2024/large/_1727239251DSC05416%20copy_1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(16,'Chân váy xòe',0,'chan-vay-xoe','Chân váy xòe dáng bút chì, tôn dáng và phù hợp với môi trường làm việc chuyên nghiệp.','[\"Chất liệu: Polyester pha elastane\", \"Form: Pencil skirt\", \"Độ dài: Qua gối\", \"Chi tiết: Dây kéo sau lưng\"]',2,'https://leika.vn/wp-content/uploads/2026/05/Chan-vay-xoe-ly-lech-bong-eo-dinh-cuc-5.jpg.webp','[\"https://leika.vn/wp-content/uploads/2026/05/Chan-vay-xoe-ly-lech-bong-eo-dinh-cuc-2.jpg\", \"https://leika.vn/wp-content/uploads/2026/05/Chan-vay-xoe-ly-lech-bong-eo-dinh-cuc-5.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(17,'Áo crop top nữ',0,'ao-croptop-nu','Áo crop top nữ trẻ trung, dễ phối cùng quần cạp cao hoặc chân váy.','[\"Chất liệu: Rayon pha polyester\", \"Form: Tailored fit\", \"Kiểu: Hai hàng cúc\", \"Chi tiết: Túi giả thời trang\"]',2,'https://leika.vn/wp-content/uploads/2026/05/Ao-kieu-CT-croptop-2-hang-cuc-TT-4.jpg.webp','[\"https://leika.vn/wp-content/uploads/2026/05/Ao-kieu-CT-croptop-2-hang-cuc-TT-2.jpg\", \"https://leika.vn/wp-content/uploads/2026/05/Ao-kieu-CT-croptop-2-hang-cuc-TT-4.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(18,'Quần jean nữ',0,'quan-jean-nu','Quần jean nữ co giãn tốt, mang lại sự thoải mái và tôn dáng cho nhiều loại trang phục.','[\"Chất liệu: Denim co giãn\", \"Form: Slim fit\", \"Cạp: Trung bình\", \"Chi tiết: Túi jean truyền thống\"]',2,'https://leika.vn/wp-content/uploads/2026/02/So-mi-DT-nep-beo-cach-dieu-5.jpg.webp','[\"https://leika.vn/wp-content/uploads/2025/12/Ao-khoac-len-tui-op-bo-phoi-ke-1.jpg\", \"https://leika.vn/wp-content/uploads/2025/12/Ao-khoac-len-det-hoa-tiet-coi-gia-1.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(19,'Áo croptop nữ',0,'ao-croptop-nu-2','Áo croptop nữ trẻ trung, dễ phối cùng quần cạp cao hoặc chân váy.','[\"Chất liệu: Cotton pha spandex\", \"Form: Fitted\", \"Độ dài: Cropped\", \"Chi tiết: Stretch mềm mại\"]',2,'https://leika.vn/wp-content/uploads/2026/05/Ao-kieu-SN-croptop-op-la-theu-bode-10.jpg.webp','[\"https://leika.vn/wp-content/uploads/2026/05/Ao-kieu-SN-croptop-op-la-theu-bode-6.jpg\", \"https://leika.vn/wp-content/uploads/2026/05/Ao-kieu-SN-croptop-op-la-theu-bode-9.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(20,'Đầm dự tiệc nữ',0,'dam-du-tiec-nu','Đầm dự tiệc nữ sang trọng, thiết kế tinh tế và phù hợp cho các buổi tiệc tối.','[\"Chất liệu: Satin pha polyester\", \"Form: A-line\", \"Độ dài: Dưới gối\", \"Chi tiết: Dây kéo ẩn sau\"]',2,'https://leika.vn/wp-content/uploads/2026/02/Dam-party-kem-ao-choang-3.jpg.webp','[\"https://leika.vn/wp-content/uploads/2026/02/Dam-party-kem-ao-choang-1.jpg\", \"https://leika.vn/wp-content/uploads/2026/02/Dam-party-kem-ao-choang-2.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(21,'Áo thun trẻ em',1,'ao-thun-tre-em','Áo thun trẻ em mềm mại, thoáng khí và an toàn cho làn da nhạy cảm của bé.','[\"Chất liệu: Cotton mềm\", \"Form: Regular fit\", \"Phong cách: In hình dễ thương\", \"Dễ giặt và nhanh khô\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483428/item/vngoods_61_483428_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483428/sub/vngoods_483428_sub3_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483428/sub/vngoods_483428_sub4_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(22,'Áo khoác trẻ em',0,'ao-khoac-tre-em','Áo khoác trẻ em nhẹ và chống gió, bảo vệ bé trong tiết trời se lạnh.','[\"Chất liệu: Nylon chống gió\", \"Lót: Polyester mềm\", \"Kiểu: Có mũ\", \"Phù hợp: Dạo chơi ngoài trời\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488841/item/vngoods_01_488841_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488841/sub/vngoods_488841_sub3_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488841/sub/vngoods_488841_sub4_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(23,'Quần short trẻ em',0,'quan-short-tre-em','Quần short trẻ em năng động, thiết kế co giãn và dễ vận động.','[\"Chất liệu: Cotton pha elastane\", \"Cạp: Thun co giãn\", \"Form: Suông rộng\", \"Thích hợp: Hoạt động hàng ngày\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487746/sub/vngoods_487746_sub11_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/487746/sub/goods_487746_sub14_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/487746/sub/goods_487746_sub21_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(24,'Váy bé gái',0,'vay-be-gai','Váy bé gái dễ thương, thiết kế nhẹ nhàng và phù hợp cho các bé đi học hoặc đi chơi.','[\"Chất liệu: Chiffon lụa\", \"Form: Xòe\", \"Lót: Satin mềm\", \"Chi tiết: Nơ hoặc ren\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484924/item/vngoods_69_484924_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484924/sub/vngoods_484924_sub3_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/484924/sub/goods_484924_sub14_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(25,'Áo UT MARIO Movie',1,'set-be-trai-summer','Áo UT trẻ em họa tiết Mario đáng yêu, phù hợp cho bé trai năng động.','[\"Chất liệu: Cotton jersey\", \"Form: Regular fit\", \"Kiểu dáng: Graphic print\", \"Dễ giặt và bền màu\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483707/sub/vngoods_483707_sub11_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/483707/sub/goods_483707_sub14_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483707/item/vngoods_00_483707_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(26,'Bộ đồ thể thao trẻ em',0,'bo-do-the-thao-tre-em','Bộ đồ thể thao trẻ em thoáng mát, linh hoạt và dễ dàng di chuyển khi chơi thể thao.','[\"Chất liệu: Polyester thoáng khí\", \"Form: Thoải mái\", \"Tính năng: Khô nhanh\", \"Chi tiết: Cạp thun co giãn\"]',3,'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/45ed24e2030c4bcb828bcdc390c9d004_9366/Bo_DJo_Det_Kim_Tre_Em_ORIGINALS_Be_KV6622_01_laydown.jpg','[\"https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/a64ddfd1530e48ea8b50bffe12ad1d9b_9366/Bo_DJo_Det_Kim_Tre_Em_ORIGINALS_Be_KV6622_02_laydown_hover.jpg\", \"https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/9a7b3c90e86a46e798bb72576b7df129_9366/Bo_DJo_Det_Kim_Tre_Em_ORIGINALS_Be_KV6622_03_laydown.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(27,'Quần jean trẻ em',0,'quan-jean-tre-em','Quần jean trẻ em bền bỉ, co giãn nhẹ và dễ phối đồ cho các bé khi đi học hoặc đi chơi.','[\"Chất liệu: Denim co giãn\", \"Form: Straight fit\", \"Cạp: Thun tiện lợi\", \"Chi tiết: Gia cố tại đầu gối\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475770/item/vngoods_62_475770_3x4.jpg','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475770/sub/vngoods_475770_sub3_3x4.jpg\", \"https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/475770/sub/goods_475770_sub15_3x4.jpg\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(28,'Áo sơ mi trẻ em',0,'ao-so-mi-tre-em','Áo sơ mi trẻ em phong cách lịch sự, phù hợp cho các bé mặc đến trường hoặc dự sự kiện gia đình.','[\"Chất liệu: Cotton poplin\", \"Form: Regular fit\", \"Kiểu cổ: Cổ đức\", \"Dễ giặt và thoáng khí\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483436/item/vngoods_00_483436_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483436/sub/vngoods_483436_sub3_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/483436/sub/goods_483436_sub14_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(29,'Váy công chúa bé gái',0,'vay-cong-chua-be-gai','Váy công chúa bé gái xinh xắn, với nhiều lớp vải bồng bềnh và chi tiết ren tinh tế.','[\"Chất liệu: Chiffon + voan\", \"Form: Xòe\", \"Chi tiết: Ren và nơ\", \"Lót: Cotton mềm\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489063/item/vngoods_01_489063_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489063/sub/vngoods_489063_sub3_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489063/sub/vngoods_489063_sub4_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(30,'Áo khoác gió trẻ em',0,'ao-khoac-gio-tre-em','Áo khoác gió trẻ em nhẹ nhàng, chống gió và phù hợp cho bé khi đi học và vui chơi ngoài trời.','[\"Chất liệu: Polyester chống gió\", \"Kiểu: Có mũ\", \"Tính năng: Chống thấm nhẹ\", \"Phù hợp: Dạo phố và đi học\"]',3,'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483443/item/vngoods_03_483443_3x4.jpg?width=400','[\"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483443/sub/vngoods_483443_sub3_3x4.jpg?width=400\", \"https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/483443/sub/vngoods_483443_sub4_3x4.jpg?width=400\"]','2026-10-01 21:39:30','2026-10-01 21:39:30',0),(33,'123',0,'test','bdc','[\"abc\"]',1,'https://www.phongcachxanh.vn/cdn/shop/files/hyperx-cloud-iii-s-wireless-tai-nghe-khong-day-120-gi-1204265829.jpg?v=1762837643&width=800','[\"https://www.phongcachxanh.vn/cdn/shop/files/hyperx-cloud-iii-s-wireless-tai-nghe-khong-day-120-gi-1204265819.jpg?v=1762837640&width=800\"]','2026-10-09 14:14:29','2026-10-10 08:01:06',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `bio` text,
  `userId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_profile_user` (`userId`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `userName` varchar(255) NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_created_at` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,3,'Nguyễn Bảo Anh',4,'Trải nghiệm tốt, giao diện đẹp','2026-10-10 08:17:19','2026-10-10 08:17:19'),(2,4,'Nguyen Huy Hoang',5,'\"Đánh giá thật lòng sau 3 ngày sử dụng sản phẩm của shop:\n- Ưu điểm: Chất lượng tốt vượt mong đợi so với tầm giá, mẫu mã y hình, vải mềm mịn/hoặc máy chạy êm.\n- Dịch vụ: Shop rep tin nhắn nhanh, hỗ trợ đổi size rất nhiệt tình.\n- Góp ý nhỏ: Đơn vị vận chuyển giao chậm hơn dự kiến 1 ngày (do bên mss/ghn), mong shop lưu ý đóng gói sớm hơn vào cuối tuần nhé. Còn lại mọi thứ đều rất tuyệt 5 sao cho shop!\"','2026-10-10 08:20:50','2026-10-10 08:20:50'),(3,4,'Nguyen Huy Hoang',5,'\"Super fast shipping and great communication! The item matches the description 100%. Quality is amazing for this price. Will definitely buy from this store again. Thank you!\"','2026-10-10 08:24:36','2026-10-10 08:24:36'),(4,3,'Nguyễn Bảo Anh',4,'Trải nghiệm cá nhân sử dụng rất tốt','2026-10-10 08:25:42','2026-10-10 08:25:42');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (6,'27'),(7,'28'),(3,'30'),(4,'32'),(5,'L'),(2,'M'),(1,'S'),(8,'XS');
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ti123','ti123@gmail.com',NULL,'$2b$10$EHEWDnx0k7b/Y6XnudnqIu.4ngU.TuN.ttJI9khc4/EfzXzfxeId2','admin','2026-10-01 15:35:30','2026-10-01 23:23:38',NULL),(2,'Nguyen Van A','A@gmail.com',NULL,'A@123456','admin','2026-10-01 23:18:31','2026-10-01 23:18:31',NULL),(3,'Nguyễn Bảo Anh','b@gmail.com',NULL,'$2b$10$IRrPtyRRwecR3bF02W6aQ.rcR5Qbg6fdDuQnSe1aCeDv6MEBi9YE6','user','2026-10-09 11:13:34','2026-10-10 07:54:18','Thành Phố Thanh Hóa'),(4,'Nguyen Huy Hoang','hoang@gmail.com',NULL,'$2b$10$LfShEqiKwdcE8WgW16zhQOoyYYbDc0z7BZDOFtJ4wlt/kmavfRw6G','user','2026-10-10 08:18:15','2026-10-10 08:19:08','Hà Nội'),(5,'Lam Thu Trang','lamthithutrang05@gmail.com',NULL,'$2b$10$cw4jWQA/cpR8O6xzJ/LCX.7ytr0atdOg/pdFovyj4ERjnR1S9kWmO','user','2026-10-20 08:19:13','2026-10-20 08:33:25','Đường z115 P.Tân Thịnh Tỉnh Thái Nguyên');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variants`
--

DROP TABLE IF EXISTS `variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `sizeId` int NOT NULL,
  `colorId` int NOT NULL,
  `price` int NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant` (`productId`,`sizeId`,`colorId`),
  KEY `fk_variants_size` (`sizeId`),
  KEY `fk_variants_color` (`colorId`),
  CONSTRAINT `fk_variants_color` FOREIGN KEY (`colorId`) REFERENCES `colors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_variants_size` FOREIGN KEY (`sizeId`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variants`
--

LOCK TABLES `variants` WRITE;
/*!40000 ALTER TABLE `variants` DISABLE KEYS */;
INSERT INTO `variants` VALUES (1,1,1,1,179000,10),(2,1,2,1,179000,10),(3,1,1,2,199000,12),(4,1,2,2,199000,12),(5,2,1,1,259000,8),(6,2,2,1,259000,8),(7,2,1,3,279000,6),(8,2,2,3,279000,6),(9,3,3,4,499000,7),(10,3,4,4,499000,5),(11,3,3,5,519000,7),(12,3,4,5,519000,5),(13,4,2,6,379000,6),(14,4,5,6,379000,4),(15,4,2,2,399000,6),(16,4,5,2,399000,4),(17,5,1,7,189000,10),(18,5,2,7,189000,8),(19,5,1,1,199000,10),(20,5,2,1,199000,8),(21,6,1,8,349000,5),(22,6,2,8,349000,4),(23,6,1,9,369000,5),(24,6,2,9,369000,4),(25,7,2,1,279000,6),(26,7,5,1,279000,5),(27,7,2,10,299000,6),(28,7,5,10,299000,5),(29,8,6,3,459000,7),(30,8,7,3,459000,6),(31,8,6,2,479000,7),(32,8,7,2,479000,6),(33,9,8,9,129000,10),(34,9,1,9,129000,9),(35,9,8,3,139000,10),(36,9,1,3,139000,9),(37,10,1,8,299000,6),(38,10,2,8,299000,5),(39,10,1,3,319000,6),(40,10,2,3,319000,5),(41,11,1,11,159000,8),(42,11,2,11,159000,7),(43,11,1,6,169000,5),(44,11,2,6,169000,7),(45,12,1,7,249000,6),(46,12,2,7,249000,5),(47,12,1,12,269000,6),(48,12,2,12,269000,5),(49,13,2,1,299000,8),(50,13,5,1,299000,8),(51,13,2,2,319000,8),(52,13,5,2,319000,8),(53,14,1,7,459000,6),(54,14,2,7,459000,6),(55,14,1,1,479000,6),(56,14,2,1,479000,6),(57,15,8,3,199000,10),(58,15,1,3,199000,10),(59,15,8,9,209000,10),(60,15,1,9,209000,10),(61,16,2,2,599000,10),(62,16,5,2,599000,10),(63,16,2,13,619000,10),(64,16,5,13,619000,10),(65,17,3,10,449000,10),(66,17,4,10,449000,10),(67,17,3,2,469000,10),(68,17,4,2,469000,10),(69,18,3,1,449000,10),(70,18,4,1,449000,10),(71,18,3,13,469000,10),(72,18,4,13,469000,10),(73,19,3,3,399000,12),(74,19,4,3,399000,8),(75,19,3,2,419000,10),(76,19,4,2,419000,7),(77,20,2,14,499000,9),(78,20,5,14,499000,6),(79,20,2,15,519000,8),(80,20,5,15,519000,5),(81,21,1,2,329000,10),(82,21,2,2,329000,7),(83,21,1,10,349000,9),(84,21,2,10,349000,6),(85,22,1,3,389000,11),(86,22,2,3,389000,8),(87,22,1,1,409000,9),(88,22,2,1,409000,7),(89,23,6,2,449000,10),(90,23,7,2,449000,7),(91,23,6,3,469000,9),(92,23,7,3,469000,6),(93,24,1,7,279000,12),(94,24,2,7,279000,8),(95,24,1,12,299000,10),(96,24,2,12,299000,6),(97,25,1,2,559000,7),(98,25,2,2,559000,5),(99,25,1,13,579000,8),(100,25,2,13,579000,6),(101,26,8,3,199000,11),(102,26,1,3,199000,9),(103,26,8,9,219000,10),(104,26,1,9,219000,8),(105,27,6,3,329000,10),(106,27,7,3,329000,7),(107,27,6,2,349000,9),(108,27,7,2,349000,6),(109,28,8,1,229000,12),(110,28,1,1,229000,9),(111,28,8,3,249000,10),(112,28,1,3,249000,8),(113,29,1,7,399000,11),(114,29,2,7,399000,8),(115,29,1,9,419000,9),(116,29,2,9,419000,6),(117,30,8,3,269000,10),(118,30,1,3,269000,7),(119,30,8,2,289000,9),(120,30,1,2,289000,6),(122,33,2,2,190000,10);
/*!40000 ALTER TABLE `variants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-24  8:12:25

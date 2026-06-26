-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tiket_kereta
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Table structure for table `jadwal`
--

DROP TABLE IF EXISTS `jadwal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jadwal` (
  `origin` varchar(100) DEFAULT NULL,
  `destination` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `arrival_time` time DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `train_name` varchar(100) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jadwal`
--

LOCK TABLES `jadwal` WRITE;
/*!40000 ALTER TABLE `jadwal` DISABLE KEYS */;
INSERT INTO `jadwal` VALUES ('Medan','Tebing Tinggi','2026-05-01','08:00:00','09:30:00',50000,'Kereta Express 101',1),('Medan','Pematang Siantar','2026-05-01','09:00:00','11:45:00',75000,'Kereta Express 102',2),('Tebing Tinggi','Pematang Siantar','2026-05-01','10:00:00','11:15:00',35000,'Kereta Lokal 201',3),('Pematang Siantar','Medan','2026-05-01','14:00:00','16:45:00',75000,'Kereta Express 103',4),('Pematang Siantar','Tebing Tinggi','2026-05-01','15:00:00','16:15:00',35000,'Kereta Lokal 202',5),('Tebing Tinggi','Medan','2026-05-01','17:00:00','18:30:00',50000,'Kereta Express 104',6),('Medan','Kisaran','2026-05-01','07:00:00','09:30:00',55000,'Kereta Lokal 203',7),('Medan','Rantau Prapat','2026-05-01','06:00:00','09:15:00',90000,'Kereta Express 105',8),('Kisaran','Medan','2026-05-01','11:00:00','13:30:00',55000,'Kereta Lokal 204',9),('Rantau Prapat','Medan','2026-05-01','12:00:00','15:15:00',90000,'Kereta Express 106',10),('Kisaran','Rantau Prapat','2026-05-01','10:00:00','11:00:00',25000,'Kereta Lokal 205',11),('Rantau Prapat','Kisaran','2026-05-01','13:00:00','14:00:00',25000,'Kereta Lokal 206',12),('Tebing Tinggi','Kisaran','2026-05-01','08:30:00','10:00:00',40000,'Kereta Lokal 207',13),('Kisaran','Pematang Siantar','2026-05-01','09:00:00','10:15:00',30000,'Kereta Lokal 208',14);
/*!40000 ALTER TABLE `jadwal` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-02  0:33:48

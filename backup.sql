-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2025 at 04:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `streetkicks`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `contact_type` varchar(50) DEFAULT 'general',
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `user_email`, `subject`, `message`, `contact_type`, `status`, `created_at`, `updated_at`) VALUES
(4, 'wuxxy@example.com', 'Message from Wuxxy', 'SDASDASD', 'general', 'pending', '2025-11-25 13:46:42', '2025-11-25 13:46:42'),
(5, 'wuxxy@example.com', 'Message from Wuxxy', 'This is a test message from the debug button', 'general', 'pending', '2025-11-25 13:46:57', '2025-11-25 13:46:57'),
(6, 'wuxxy@example.com', 'Message from Wuxxy', 'WQEQWEQWE', 'general', 'pending', '2025-11-25 13:49:07', '2025-11-25 13:49:07'),
(7, 'wuxxy@example.com', 'Message from Wuxxy', 'DASDSADASD', 'shipping', 'pending', '2025-11-25 13:49:37', '2025-11-25 13:49:37'),
(8, 'russel.ebanez@hcdc.edu.ph', 'Message from Wuxxy', 'SDAD', 'order', 'pending', '2025-11-25 13:53:12', '2025-11-25 13:53:12'),
(9, 'Wuxxy@example.com', 'Message from Wuxxy', 'DFSFDSF', 'general', 'pending', '2025-11-25 13:57:03', '2025-11-25 13:57:03'),
(10, 'wuxxy@example.com', 'Message from Test User', 'Test message', 'general', 'pending', '2025-11-25 13:57:17', '2025-11-25 13:57:17'),
(11, 'Wuxxy@example.com', 'Message from Wuxxy', 'DASDASD', 'shipping', 'pending', '2025-11-25 13:58:55', '2025-11-25 13:58:55'),
(12, 'reddragon911x@gmail.com', 'Message from Wuxxy', 'ssssssssssssssssssssssssssssssssssss', 'product', 'pending', '2025-11-25 14:01:47', '2025-11-25 14:01:47'),
(13, 'russel.ebanez@hcdc.edu.ph', 'Message from Wuxxy', 'asddasd', 'general', 'pending', '2025-11-25 14:25:29', '2025-11-25 14:25:29');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `product_image` text DEFAULT NULL,
  `size` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'pending',
  `payment_method` varchar(100) DEFAULT 'cash',
  `customer_address` text DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_email`, `product_title`, `product_image`, `size`, `price`, `quantity`, `order_date`, `status`, `payment_method`, `customer_address`, `customer_name`, `customer_phone`) VALUES
(11, 'Wuxxy@example.com', 'Air Jordan 1 Low', '/blurjordan.png', '7', 6500.00, 3, '2025-11-25 12:54:47', 'cancelled', 'cash', 'dasdasdasd', 'sdasdasd', 'dasdasd'),
(12, 'Wuxxy@example.com', 'Palermo Leather Sneakers', '/palermo.avif', '6', 4576.00, 1, '2025-11-25 14:02:56', 'cancelled', 'cash', 'blk12 lot 5 southvila, maa davao city', 'Junelyn balaga', '09388524373'),
(13, 'Wuxxy', 'Air Jordan 1 Low', '/blurjordan.png', '7.5', 6500.00, 1, '2025-11-25 14:13:55', 'pending', 'cash', 'blk12 lot 5 southvila, maa davao city', 'Junelyn balaga', '09388524373'),
(14, 'russel.ebanez@hcdc.edu.ph', 'Palermo Leather Sneakers Unisex', '/palermo.avif', '8', 4576.00, 1, '2025-11-25 14:18:42', 'cancelled', 'cash', 'blk12 lot 5 southvila, maa davao city', 'Junelyn balaga', '09388524373'),
(15, 'russel.ebanez@hcdc.edu.ph', 'Palermo Leather Sneakers Unisex', '/palermo.avif', '7.5', 4576.00, 1, '2025-11-25 15:15:09', 'cancelled', 'cash', 'blk12 lot 5 southvila, maa davao city', 'Junelyn balaga', '09388524373'),
(16, 'russel.ebanez@hcdc.edu.ph', 'Air Jordan 1 Low', '/blurjordan.png', '7.5', 6500.00, 1, '2025-11-26 09:43:20', 'pending', 'cash', 'blk12 lot 5 southvila, maa davao city', 'Junelyn balaga', '09388524373');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `price`, `image_url`, `description`, `created_at`) VALUES
(1, 'Nike Dunk Low', 'nike-dunk-low', 7894.00, '/nike.avif', 'Classic Nike Dunk Low with street-ready style.', '2025-11-26 12:03:31'),
(2, 'Air Jordan 1 Low', 'air-jordan-1-low', 6500.00, '/blurjordan.png', 'Clean and iconic Air Jordan 1 Low, perfect for any outfit.', '2025-11-26 12:03:31'),
(3, 'Palermo Leather Sneakers Unisex', 'palermo-leather-sneakers', 4576.00, '/palermo.avif', 'Premium leather sneakers suitable for men and women.', '2025-11-26 12:03:31'),
(4, 'Chuck Taylor All Star', 'chuck-taylor-all-star', 3600.00, '/chuck.webp', 'Timeless Chuck Taylor All Star sneakers for everyday wear.', '2025-11-26 12:03:31'),
(5, 'Adizero Evo Sl Men\'s Shoes', 'adizero-evo-sl', 4200.00, '/adizero.webp', 'Lightweight and responsive Adizero Evo Sl for runners.', '2025-11-26 14:37:10'),
(6, '740 unisex sneakers shoes', 'new-balance', 4890.00, '/nb.webp', 'Comfortable and stylish New Balance sneakers.', '2025-11-26 14:37:10'),
(7, 'Air Jordan 4 Retro Men\'s Basketball Shoes', 'air-jordan-4-retro', 5000.00, '/retro.avif', 'Classic Air Jordan 4 Retro for basketball enthusiasts.', '2025-11-26 14:37:10');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(255) NOT NULL,
  `comment` text NOT NULL,
  `verified_purchase` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_email`, `rating`, `title`, `comment`, `verified_purchase`, `created_at`, `updated_at`) VALUES
(25, 1, 'russel.ebanez@hcdc.edu.ph', 5, 'dsadasdasd', 'asdasdasdasdasd', 0, '2025-11-26 14:40:18', '2025-11-26 14:40:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `name`, `profile_pic`, `created_at`) VALUES
(6, 'Wuxx', 'russel.ebanez@hcdc.edu.ph', '$2b$10$uNgNia0zmGfLyFDo4CUQgO6Zf9E2K0B2LlLY.q8/Q2on3tIS0sNiK', NULL, '/default-avatar.png', '2025-11-23 10:19:59'),
(7, 'patotoya', 'patotoya@gmail.com', '$2b$10$sP0/4FL1PiuSzKTvnr0CAus/nUyRZPfOx0.1RMtI7bBR1QmVd2IXi', NULL, NULL, '2025-11-23 10:21:27'),
(8, 'Fuz', 'reddragon911x@gmail.com', '$2b$10$/IYWJhdCqbx37zRmK5/Kv.B/vRQpCYOMAkiOvO6yeEzUXTL/cbDQq', NULL, NULL, '2025-11-24 13:01:27'),
(12, 'redddd', 'bluedragon911x@gmail.com', '$2b$10$PpYoSKl3OwKZf8jp8mwUQeP458BVwICHEWkHGRhlsRYGBir79lPn.', NULL, NULL, '2025-11-25 15:04:43'),
(13, 'Maria S.', 'maria@example.com', 'hashed_password', NULL, NULL, '2025-11-26 12:03:31'),
(14, 'John D.', 'john@example.com', 'hashed_password', NULL, NULL, '2025-11-26 12:03:31'),
(15, 'Sarah L.', 'sarah@example.com', 'hashed_password', NULL, NULL, '2025-11-26 12:03:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_email` (`user_email`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product` (`user_email`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

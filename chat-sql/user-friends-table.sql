
CREATE TABLE `user_friends` (
  `friend_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id1` bigint(20) NOT NULL,
  `user_id2` bigint(20) NOT NULL,
  `requester_id` bigint(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`friend_id`),
  UNIQUE KEY `uk_user_friends` (`user_id1`,`user_id2`),
  KEY `fk_user_friends_user1` (`user_id1`),
  KEY `fk_user_friends_user2` (`user_id2`),
  KEY `fk_user_friends_requester` (`requester_id`),
  CONSTRAINT `fk_user_friends_user1` FOREIGN KEY (`user_id1`) REFERENCES `user_base` (`user_id`),
  CONSTRAINT `fk_user_friends_user2` FOREIGN KEY (`user_id2`) REFERENCES `user_base` (`user_id`),
  CONSTRAINT `fk_user_friends_requester` FOREIGN KEY (`requester_id`) REFERENCES `user_base` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

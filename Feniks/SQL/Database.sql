CREATE TABLE Scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    score INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL
);

CREATE TABLE Skins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    expiry_date DATETIME NOT NULL
);

CREATE TABLE Descriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    linked_id INT NOT NULL,
    linked_type ENUM('skin', 'theme') NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (linked_id) REFERENCES Skins(skin_id),
    FOREIGN KEY (linked_id) REFERENCES Themes(theme_id)
);

CREATE TABLE CodeLinks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_id INT NOT NULL,
    linked_id INT NOT NULL,
    linked_type ENUM('skin', 'theme') NOT NULL,
    FOREIGN KEY (code_id) REFERENCES Codes(code_id),
    FOREIGN KEY (linked_id) REFERENCES Skins(skin_id),
    FOREIGN KEY (linked_id) REFERENCES Themes(theme_id),
    CHECK (linked_type = 'skin' OR linked_type = 'theme')
);

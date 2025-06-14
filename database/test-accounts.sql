-- Test accounts for CSE 340 Motor Company
-- These accounts have the password "password" hashed with bcrypt

-- Insert test accounts
-- Password: "password" hashed with bcrypt (12 rounds)
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type)
VALUES 
('Admin', 'User', 'admin@example.com', '$2b$12$XoY4aV4yl9mNZjnJOm1L3O.h7KJgB7p5FH5vJ8ZVN9QOt8OJQY9DW', 'Admin'),
('Employee', 'User', 'employee@example.com', '$2b$12$XoY4aV4yl9mNZjnJOm1L3O.h7KJgB7p5FH5vJ8ZVN9QOt8OJQY9DW', 'Employee'),
('Client', 'User', 'client@example.com', '$2b$12$XoY4aV4yl9mNZjnJOm1L3O.h7KJgB7p5FH5vJ8ZVN9QOt8OJQY9DW', 'Client')
ON CONFLICT (account_email) DO NOTHING;

-- Note: The hashed password above represents "password"
-- In a real application, passwords should be properly hashed on registration 
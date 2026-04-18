<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'  => 'Hapag Admin',
            'email' => 'admin@hapag.com',
            'password' => 'password',
            'role'  => 'admin',
            'email_verified_at' => now(),
        ]);

        // 15 Owners — some own multiple branches (see RestaurantSeeder)
        $owners = [
            // Lutong Bahay ni Aling Rosa owners
            ['name' => 'Maria Santos',       'email' => 'owner1@hapag.com'],  // SC + Pagsanjan
            ['name' => 'Ricardo dela Cruz',  'email' => 'owner2@hapag.com'],  // Los Baños + Calamba
            ['name' => 'Josefina Reyes',     'email' => 'owner3@hapag.com'],  // San Pablo

            // Grill Masters PH owners
            ['name' => 'Antonio Buenaventura', 'email' => 'owner4@hapag.com'], // SC + Calamba
            ['name' => 'Luzviminda Aguilar',   'email' => 'owner5@hapag.com'], // Sta. Rosa + San Pablo

            // Kape't Tinapay owners
            ['name' => 'Eduardo Macaraeg',   'email' => 'owner6@hapag.com'],  // Pagsanjan + SC
            ['name' => 'Corazon Dimayuga',   'email' => 'owner7@hapag.com'],  // Los Baños + Biñan
            ['name' => 'Bernardo Soriano',   'email' => 'owner8@hapag.com'],  // Sta. Rosa + Cabuyao

            // La Preciosa Bakery owners
            ['name' => 'Felicitas Aquino',   'email' => 'owner9@hapag.com'],  // Pagsanjan + Calamba
            ['name' => 'Rodrigo Castillo',   'email' => 'owner10@hapag.com'], // San Pablo + Biñan

            // Mama Nena's Carinderia owners
            ['name' => 'Amelita Villanueva', 'email' => 'owner11@hapag.com'], // Los Baños + SC
            ['name' => 'Crisanto Bautista',  'email' => 'owner12@hapag.com'], // Cabuyao + Sta. Rosa
            ['name' => 'Dolores Ramos',      'email' => 'owner13@hapag.com'], // San Pablo

            // Bida Burger owners
            ['name' => 'Herminio Pascual',   'email' => 'owner14@hapag.com'], // Calamba + Biñan + Sta. Rosa
            ['name' => 'Virgilia Mendoza',   'email' => 'owner15@hapag.com'], // Cabuyao + SC + Los Baños
        ];

        foreach ($owners as $owner) {
            User::create([
                'name'  => $owner['name'],
                'email' => $owner['email'],
                'password' => 'password',
                'role'  => 'owner',
                'email_verified_at' => now(),
            ]);
        }

        // 5 Test Customers
        $customers = [
            ['name' => 'Juan dela Cruz',    'email' => 'juan@example.com'],
            ['name' => 'Ana Reyes',         'email' => 'ana@example.com'],
            ['name' => 'Mark Santos',       'email' => 'mark@example.com'],
            ['name' => 'Grace Villanueva',  'email' => 'grace@example.com'],
            ['name' => 'Carlo Manalo',      'email' => 'carlo@example.com'],
        ];

        foreach ($customers as $customer) {
            User::create([
                'name'  => $customer['name'],
                'email' => $customer['email'],
                'password' => 'password',
                'role'  => 'customer',
                'email_verified_at' => now(),
            ]);
        }
    }
}

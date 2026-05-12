<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────
        User::create([
            'name'              => 'Hapag Admin',
            'email'             => 'admin@hapag.com',
            'password'          => 'password',
            'role'              => 'admin',
            'address'           => 'Brgy. Poblacion, Santa Cruz, Laguna',
            'email_verified_at' => now(),
        ]);

        // ── 15 Owners (addresses near their restaurant municipalities) ────
        $owners = [
            ['name' => 'Maria Santos',         'email' => 'owner1@hapag.com',  'address' => 'Brgy. Bubukal, Santa Cruz, Laguna'],
            ['name' => 'Ricardo dela Cruz',    'email' => 'owner2@hapag.com',  'address' => 'Brgy. Parian, Calamba City, Laguna'],
            ['name' => 'Josefina Reyes',       'email' => 'owner3@hapag.com',  'address' => 'Brgy. San Buenaventura, San Pablo City, Laguna'],
            ['name' => 'Antonio Buenaventura', 'email' => 'owner4@hapag.com',  'address' => 'Brgy. Real, Calamba City, Laguna'],
            ['name' => 'Luzviminda Aguilar',   'email' => 'owner5@hapag.com',  'address' => 'Brgy. Tagapo, Sta. Rosa City, Laguna'],
            ['name' => 'Eduardo Macaraeg',     'email' => 'owner6@hapag.com',  'address' => 'Brgy. Pinagsanjan, Pagsanjan, Laguna'],
            ['name' => 'Corazon Dimayuga',     'email' => 'owner7@hapag.com',  'address' => 'Brgy. Anos, Los Baños, Laguna'],
            ['name' => 'Bernardo Soriano',     'email' => 'owner8@hapag.com',  'address' => 'Brgy. Balibago, Sta. Rosa City, Laguna'],
            ['name' => 'Felicitas Aquino',     'email' => 'owner9@hapag.com',  'address' => 'Brgy. Lambac, Pagsanjan, Laguna'],
            ['name' => 'Rodrigo Castillo',     'email' => 'owner10@hapag.com', 'address' => 'Brgy. San Rafael, San Pablo City, Laguna'],
            ['name' => 'Amelita Villanueva',   'email' => 'owner11@hapag.com', 'address' => 'Brgy. Putho Tuntungin, Los Baños, Laguna'],
            ['name' => 'Crisanto Bautista',    'email' => 'owner12@hapag.com', 'address' => 'Brgy. Sala, Cabuyao City, Laguna'],
            ['name' => 'Dolores Ramos',        'email' => 'owner13@hapag.com', 'address' => 'Brgy. San Gregorio, San Pablo City, Laguna'],
            ['name' => 'Herminio Pascual',     'email' => 'owner14@hapag.com', 'address' => 'Brgy. Uno, Calamba City, Laguna'],
            ['name' => 'Virgilia Mendoza',     'email' => 'owner15@hapag.com', 'address' => 'Brgy. Bigaa, Cabuyao City, Laguna'],
        ];

        foreach ($owners as $owner) {
            User::create([
                'name'              => $owner['name'],
                'email'             => $owner['email'],
                'password'          => 'password',
                'role'              => 'owner',
                'address'           => $owner['address'],
                'email_verified_at' => now(),
            ]);
        }

        // ── 30 Customers (barangay-level addresses across 8 Laguna cities) ─
        $customers = [
            ['name' => 'Juan dela Cruz',      'email' => 'juan@example.com',    'address' => 'Brgy. Poblacion, Santa Cruz, Laguna'],
            ['name' => 'Ana Reyes',           'email' => 'ana@example.com',     'address' => 'Brgy. Batong Malake, Los Baños, Laguna'],
            ['name' => 'Mark Santos',         'email' => 'mark@example.com',    'address' => 'Brgy. Tagapo, Sta. Rosa City, Laguna'],
            ['name' => 'Grace Villanueva',    'email' => 'grace@example.com',   'address' => 'Brgy. Parian, Calamba City, Laguna'],
            ['name' => 'Carlo Manalo',        'email' => 'carlo@example.com',   'address' => 'Brgy. Pinagsanjan, Pagsanjan, Laguna'],
            ['name' => 'Lea Bautista',        'email' => 'lea@example.com',     'address' => 'Brgy. San Buenaventura, San Pablo City, Laguna'],
            ['name' => 'Ryan Castillo',       'email' => 'ryan@example.com',    'address' => 'Brgy. Banay-Banay, Cabuyao City, Laguna'],
            ['name' => 'Jessa Aquino',        'email' => 'jessa@example.com',   'address' => 'Brgy. Poblacion, Biñan City, Laguna'],
            ['name' => 'Paolo Garcia',        'email' => 'paolo@example.com',   'address' => 'Brgy. Anos, Los Baños, Laguna'],
            ['name' => 'Mia Torres',          'email' => 'mia@example.com',     'address' => 'Brgy. Balibago, Sta. Rosa City, Laguna'],
            ['name' => 'Kevin Flores',        'email' => 'kevin@example.com',   'address' => 'Brgy. Real, Calamba City, Laguna'],
            ['name' => 'Rina Lopez',          'email' => 'rina@example.com',    'address' => 'Brgy. Lambac, Pagsanjan, Laguna'],
            ['name' => 'Dante Navarro',       'email' => 'dante@example.com',   'address' => 'Brgy. Market Area, Santa Cruz, Laguna'],
            ['name' => 'Camille Ramos',       'email' => 'camille@example.com', 'address' => 'Brgy. Concepcion, San Pablo City, Laguna'],
            ['name' => 'Jerome Mendoza',      'email' => 'jerome@example.com',  'address' => 'Brgy. Sala, Cabuyao City, Laguna'],
            ['name' => 'Trisha Macaraeg',     'email' => 'trisha@example.com',  'address' => 'Brgy. Halang, Calamba City, Laguna'],
            ['name' => 'Aldrin Soriano',      'email' => 'aldrin@example.com',  'address' => 'Brgy. Bayog, Los Baños, Laguna'],
            ['name' => 'Bianca Dimayuga',     'email' => 'bianca@example.com',  'address' => 'Brgy. Malusak, Sta. Rosa City, Laguna'],
            ['name' => 'Patrick Cruz',        'email' => 'patrick@example.com', 'address' => 'Brgy. Soro-Soro, Biñan City, Laguna'],
            ['name' => 'Sheila Buenaventura', 'email' => 'sheila@example.com',  'address' => 'Brgy. Putho Tuntungin, Los Baños, Laguna'],
            ['name' => 'Rodel Pascual',       'email' => 'rodel@example.com',   'address' => 'Brgy. Bubukal, Santa Cruz, Laguna'],
            ['name' => 'Noemi Aguilar',       'email' => 'noemi@example.com',   'address' => 'Brgy. San Rafael, San Pablo City, Laguna'],
            ['name' => 'Francis Dela Torre',  'email' => 'francis@example.com', 'address' => 'Brgy. Bigaa, Cabuyao City, Laguna'],
            ['name' => 'Maribel Ong',         'email' => 'maribel@example.com', 'address' => 'Brgy. Pinagsanjan, Pagsanjan, Laguna'],
            ['name' => 'Renato Lim',          'email' => 'renato@example.com',  'address' => 'Brgy. Uno, Calamba City, Laguna'],
            ['name' => 'Cristina Tan',        'email' => 'cristina@example.com','address' => 'Brgy. Cuyab, San Pedro City, Laguna'],
            ['name' => 'Andrei Reyes',        'email' => 'andrei@example.com',  'address' => 'Brgy. Ganado, Santa Cruz, Laguna'],
            ['name' => 'Vivian Santos',       'email' => 'vivian@example.com',  'address' => 'Brgy. Anos, Los Baños, Laguna'],
            ['name' => 'Dennis Bernardo',     'email' => 'dennis@example.com',  'address' => 'Brgy. Tagapo, Sta. Rosa City, Laguna'],
            ['name' => 'Lourdes Enriquez',    'email' => 'lourdes@example.com', 'address' => 'Brgy. Baclaran, Sta. Rosa City, Laguna'],
        ];

        foreach ($customers as $customer) {
            User::create([
                'name'              => $customer['name'],
                'email'             => $customer['email'],
                'password'          => 'password',
                'role'              => 'customer',
                'address'           => $customer['address'],
                'email_verified_at' => now(),
            ]);
        }
    }
}

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
            'email_verified_at' => now(),
        ]);

        // ── 15 Owners ─────────────────────────────────────────────────────
        $owners = [
            ['name' => 'Maria Santos',          'email' => 'owner1@hapag.com'],
            ['name' => 'Ricardo dela Cruz',     'email' => 'owner2@hapag.com'],
            ['name' => 'Josefina Reyes',        'email' => 'owner3@hapag.com'],
            ['name' => 'Antonio Buenaventura',  'email' => 'owner4@hapag.com'],
            ['name' => 'Luzviminda Aguilar',    'email' => 'owner5@hapag.com'],
            ['name' => 'Eduardo Macaraeg',      'email' => 'owner6@hapag.com'],
            ['name' => 'Corazon Dimayuga',      'email' => 'owner7@hapag.com'],
            ['name' => 'Bernardo Soriano',      'email' => 'owner8@hapag.com'],
            ['name' => 'Felicitas Aquino',      'email' => 'owner9@hapag.com'],
            ['name' => 'Rodrigo Castillo',      'email' => 'owner10@hapag.com'],
            ['name' => 'Amelita Villanueva',    'email' => 'owner11@hapag.com'],
            ['name' => 'Crisanto Bautista',     'email' => 'owner12@hapag.com'],
            ['name' => 'Dolores Ramos',         'email' => 'owner13@hapag.com'],
            ['name' => 'Herminio Pascual',      'email' => 'owner14@hapag.com'],
            ['name' => 'Virgilia Mendoza',      'email' => 'owner15@hapag.com'],
        ];

        foreach ($owners as $owner) {
            User::create([
                'name'              => $owner['name'],
                'email'             => $owner['email'],
                'password'          => 'password',
                'role'              => 'owner',
                'email_verified_at' => now(),
            ]);
        }

        // ── 60 Customers ──────────────────────────────────────────────────
        // Large pool so OrderSeeder has many unique users per restaurant
        // and VoucherSeeder can assign claims to different users
        $customers = [
            ['name' => 'Juan dela Cruz',        'email' => 'juan@example.com'],
            ['name' => 'Ana Reyes',             'email' => 'ana@example.com'],
            ['name' => 'Mark Santos',           'email' => 'mark@example.com'],
            ['name' => 'Grace Villanueva',      'email' => 'grace@example.com'],
            ['name' => 'Carlo Manalo',          'email' => 'carlo@example.com'],
            ['name' => 'Lea Bautista',          'email' => 'lea@example.com'],
            ['name' => 'Ryan Castillo',         'email' => 'ryan@example.com'],
            ['name' => 'Jessa Aquino',          'email' => 'jessa@example.com'],
            ['name' => 'Paolo Garcia',          'email' => 'paolo@example.com'],
            ['name' => 'Mia Torres',            'email' => 'mia@example.com'],
            ['name' => 'Kevin Flores',          'email' => 'kevin@example.com'],
            ['name' => 'Rina Lopez',            'email' => 'rina@example.com'],
            ['name' => 'Dante Navarro',         'email' => 'dante@example.com'],
            ['name' => 'Camille Ramos',         'email' => 'camille@example.com'],
            ['name' => 'Jerome Mendoza',        'email' => 'jerome@example.com'],
            ['name' => 'Trisha Macaraeg',       'email' => 'trisha@example.com'],
            ['name' => 'Aldrin Soriano',        'email' => 'aldrin@example.com'],
            ['name' => 'Bianca Dimayuga',       'email' => 'bianca@example.com'],
            ['name' => 'Patrick Cruz',          'email' => 'patrick@example.com'],
            ['name' => 'Sheila Buenaventura',   'email' => 'sheila@example.com'],
            ['name' => 'Rodel Pascual',         'email' => 'rodel@example.com'],
            ['name' => 'Noemi Aguilar',         'email' => 'noemi@example.com'],
            ['name' => 'Francis Dela Torre',    'email' => 'francis@example.com'],
            ['name' => 'Maribel Ong',           'email' => 'maribel@example.com'],
            ['name' => 'Renato Lim',            'email' => 'renato@example.com'],
            ['name' => 'Cristina Tan',          'email' => 'cristina@example.com'],
            ['name' => 'Andrei Reyes',          'email' => 'andrei@example.com'],
            ['name' => 'Vivian Santos',         'email' => 'vivian@example.com'],
            ['name' => 'Dennis Bernardo',       'email' => 'dennis@example.com'],
            ['name' => 'Lourdes Enriquez',      'email' => 'lourdes@example.com'],
            ['name' => 'Efren Hidalgo',         'email' => 'efren@example.com'],
            ['name' => 'Maricel Villanueva',    'email' => 'maricel@example.com'],
            ['name' => 'Jomar Salazar',         'email' => 'jomar@example.com'],
            ['name' => 'Charisse dela Rosa',    'email' => 'charisse@example.com'],
            ['name' => 'Arnold Bello',          'email' => 'arnold@example.com'],
            ['name' => 'Yvonne Macapagal',      'email' => 'yvonne@example.com'],
            ['name' => 'Nelson Tolentino',      'email' => 'nelson@example.com'],
            ['name' => 'Abigail Ocampo',        'email' => 'abigail@example.com'],
            ['name' => 'Eduardo Peralta',       'email' => 'eduardo@example.com'],
            ['name' => 'Sunshine Padilla',      'email' => 'sunshine@example.com'],
            ['name' => 'Romeo Delos Santos',    'email' => 'romeo@example.com'],
            ['name' => 'Fe Magpantay',          'email' => 'fe@example.com'],
            ['name' => 'Alvin Perez',           'email' => 'alvin@example.com'],
            ['name' => 'Cherry Guevara',        'email' => 'cherry@example.com'],
            ['name' => 'Wilbert Sison',         'email' => 'wilbert@example.com'],
            ['name' => 'Rowena Magsino',        'email' => 'rowena@example.com'],
            ['name' => 'Marlon Samonte',        'email' => 'marlon@example.com'],
            ['name' => 'Glenda Alcantara',      'email' => 'glenda@example.com'],
            ['name' => 'Teodoro Galang',        'email' => 'teodoro@example.com'],
            ['name' => 'Josephine Sabado',      'email' => 'josephine@example.com'],
            ['name' => 'Michael Delos Reyes',   'email' => 'michael@example.com'],
            ['name' => 'Natividad Roque',       'email' => 'natividad@example.com'],
            ['name' => 'Ricky Espiritu',        'email' => 'ricky@example.com'],
            ['name' => 'Laila Montemayor',      'email' => 'laila@example.com'],
            ['name' => 'Bernardo Panlilio',     'email' => 'bernardo@example.com'],
            ['name' => 'Sheryl Maceda',         'email' => 'sheryl@example.com'],
            ['name' => 'Victor Quiambao',       'email' => 'victor@example.com'],
            ['name' => 'Erlinda Crisostomo',    'email' => 'erlinda@example.com'],
            ['name' => 'Jeffrey Ilagan',        'email' => 'jeffrey@example.com'],
            ['name' => 'Rosario Villafuerte',   'email' => 'rosario@example.com'],
        ];

        foreach ($customers as $customer) {
            User::create([
                'name'              => $customer['name'],
                'email'             => $customer['email'],
                'password'          => 'password',
                'role'              => 'customer',
                'email_verified_at' => now(),
            ]);
        }
    }
}

<?php
$user = App\Models\User::where('role','customer')->first();
if ($user) {
    $user->has_seen_tour = false;
    $user->has_dismissed_progress_bar = false;
    $user->municipality = null;
    $user->address = null;
    $user->avatar_url = null;
    $user->save();
    echo "OK: " . $user->email . " | " . $user->name . " | id:" . $user->id;
} else {
    echo "NO CUSTOMER FOUND";
}

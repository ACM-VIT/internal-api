<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    //

    protected $fillable = [
        'location',
        'addressed_by',
        'agenda',
        'from',
        'till',
        'meeting_for'

    ];

    public function users()
    {
        $this->hasMany();
    }
}

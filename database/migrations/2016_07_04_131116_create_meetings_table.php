<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMeetingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->string('location');
            $table->string('addressed_by');
            $table->text('agenda');
            $table->timestamp('from'); // From time
            $table->timestamp('till'); // until
            $table->string('meeting_for'); // Array of ids of role -Tech,management, etc

            /*
             * We can add more fields here.
             *
             * */

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('meetings');
    }
}

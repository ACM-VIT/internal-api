<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAnnouncementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create(/**
         * @param Blueprint $table
         */
            'announcements', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->timestamp('time');
            $table->text('comments');
            $table->text('location'); // SJT, TT etc.
            $table->integer('assigned_by');
            $table->boolean('isCompleted')->default(0);
            $table->text('review'); // Bachhe k comments.
            $table->integer('with_user');
            $table->timestamps();
            /*
             * Send two requests, interchange the user_id and with_user*/

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('announcements');
    }
}

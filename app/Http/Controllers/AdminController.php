<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Meeting;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    /*
     * This controller will controll all the admin related requests.
     * Middleware to be used : isAdmin
     * */

    public function __construct()
    {
        $this->middleware('isAdmin',[
            'except'=> [


            ]
        ]);
    }

    /*
     * Remove a user
     * */
    public function removeUser($userID)
    {
        $user = User::where('id',$userID)->first();

        if($user) {
            $request = $user->delete();
            return view('Admin.AdminPanel');
        }
        else
        {
            return view('errors.404');
        }
    }

    /*
     * Show all users with Admin Rights
     * */

    public function showAllUsersWithAdminRights()
    {
        $users = User::all();
        return view('Admin.AdminPanel',compact('users'));
    }

    /*
     * Make an announcement
     * */

    public function makeAnnouncement(Request $request)
    {
        return $request->all();
    }

    /*
     * Call a meeting
     * */
    public function callMeeting(Request $request)
    {
        $addressedBy = Auth::user()->name;
        $location = $request->venue;
        $agenda = $request->details;
        $from = $request->timeStart;
        $till = $request->timeUpto;
        $meetingFor = $request->subject;
        $meeting = new Meeting();
        $meeting->location = $location;
        $meeting->agenda = $agenda;
        $meeting->from = $from;
        $meeting->till = $till;
        $meeting->addressed_by = $addressedBy;
        $meeting->meeting_for = $meetingFor;
        $meeting->save();
        return back();
    }
}

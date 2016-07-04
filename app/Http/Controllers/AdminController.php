<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;

use App\Http\Requests;
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

    public function showAllUsersWithAdminRights()
    {
        $users = User::all();
        return view('Admin.AdminPanel',compact('users'));
    }

}

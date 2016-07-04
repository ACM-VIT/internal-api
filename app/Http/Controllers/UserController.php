<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

use App\Http\Requests;

class UserController extends Controller
{
    /*
     * This controller will contain all the user related tasks.
     * */

    /**
     * Create a new controller instance.
     *
     *
     */


    public function __construct()
    {
        $this->middleware('auth',[
            'only'=> [
                'showAllUsers',
                
            ]
        ]);
    }

    public function showAllUsersAPI()
    {

        $users = User::all();
        return $users;

    }

    /*
     * Show all user controller for web view.
     * */
    public function showAllUsers()
    {

        $users = User::all();
        return view('User.showAll',compact('users'));

    }
}

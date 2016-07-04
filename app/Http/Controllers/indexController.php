<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class indexController extends Controller
{
    /*
     * Index controller.
     * Include ->
     * Author,
     * Contributor,
     * Version,
     * Status */

    public function index()
    {
       $response = array([
           'author'=>'Ashwini Purohit',
           'token'=>csrf_token(),
           'version' => 'v0.1',
           'method' => 'GET',
           'status' => 1,
           'message' => 'API Working',
           'contributors' => ['Ashwini','Abhinav']
 
       ]);
        return $response;
    }
    
}

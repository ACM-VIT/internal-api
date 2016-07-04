<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/


/*
 *
 * All the routes to be defined over here.
 * Basic structure :
 * @params, method*/

Route::get('/','indexController@index');


Route::auth();

Route::get('/home', 'HomeController@index');

/*
 * Show All users controller API.
 *
 */
Route::get('api/users/all', 'UserController@showAllUsersAPI');

/*
 * Show all users in a view.
 * For Web.
 * @params => None*/

Route::get('/users/all','UserController@showAllUsers');

/*
 * User management for Admin
 *
 * */

Route::get('/admin/users/all','AdminController@showAllUsersWithAdminRights');

/*
 * Delete any user .
 * Middleware => isAdmin
 * @params => userID
 * */

Route::get('/user/delete/{userID}','AdminController@removeUser');



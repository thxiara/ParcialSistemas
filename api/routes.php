<?php
## Routing API (Gatos)
$router->get('/api/cat', 'catController@getAll');
$router->get('/api/cat/:id', 'catController@get');
$router->post('/api/cat', 'catController@add');
$router->put('/api/cat/:id', 'catController@update');
$router->delete('/api/cat/:id', 'catController@remove');

## Routing Vistas
$router->get('/', 'accessController@landing');
$router->get('/cat/list', 'accessController@listCat');
$router->get('/cat/add', 'accessController@addCat');
$router->get('/cat/edit', 'accessController@editCat');

<?php
require_once '../../lib/TwitterExtended.class.php';

/* 
 * Provides routing for Twitter API requests
 */

try {
    $Twitter = new TwitterExtended();
} catch (TwitterExtendedException $ex) {
    header('HTTP', true, 500);
    echo 'We\'ve got some issue with application at the moment. Please try again later.';
    die;
}

switch ($_REQUEST['gate']) {
    case 'get-user':
        echo $Twitter->getUserByName($_REQUEST['username']);
        break;
    case 'get-tweets':
        echo $Twitter->getLastTweetsForUser($_REQUEST['user_id'], 5);
        break;
    default:
        $noRouteFoundError = array('error' => 'Can\'t match given route!');
        echo json_encode($noRouteFoundError);
        break;
}
die;

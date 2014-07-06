<?php
// configs
require_once $_SERVER['DOCUMENT_ROOT'] . '/finder/twitter/data/twitter_settings.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/finder/twitter/data/twitter_api_links.php';

// parent class
require_once $_SERVER['DOCUMENT_ROOT'] . '/finder/twitter/lib/TwitterAPIExchange.php';

/**
 * Class extending functionality of base TwitterAPIExchanger.
 * @author Bartosz Polak
 */
class TwitterExtended extends TwitterAPIExchange
{
    /**
     * Stores links to Twitter API gateways.
     * @var stdClass
     */
    protected $TwitterApiLinks;
    
    
    protected function checkConfig($params)
    {
        if ( empty($params['oauth_access_token'])
            || empty($params['oauth_access_token_secret'])
            || empty($params['consumer_key'])
            || empty($params['consumer_secret']))
        {
            throw new TwitterExtendedException('123 Make sure you are passing in the correct parameters');
        }
    }
    
    /**
     * Creates TwitterAPIExchange object with settings provided for OAuth Twitter API.
     * @see ./data/twitter_settings.php
     * @throws TwitterExtendedException When cURL not found or OAuth settings not provided.
     * @return TwitterAPIExchange
     */
    public function __construct()
    {
        global $twitterApiSettings, $TwitterApiLinks;
        
        $this->TwitterApiLinks = $TwitterApiLinks;
        
        $this->checkConfig($twitterApiSettings);
        try {
            parent::__construct($twitterApiSettings);
        } catch (Exception $ex) {
            throw new TwitterExtendedException($ex->getMessage());
        }
    }
    
    /**
     * Perform Twitter user search. Returns 1st page with 5 results.
     * @param string $username Username we're searching for.
     * @return JSON
     */
    public function getUserByName($username)
    {
        $getfield = '?q=' . rawurlencode($username)
                . '&page=' . 1
                . '&count=' . 5;
        
        return parent::setGetfield($getfield)
                ->buildOauth($this->TwitterApiLinks->getUser, 'GET')
                ->performRequest();
    }
    
    /**
     * Returns latest tweets for user.
     * @param int $userId
     * @param int $tweetsLimit
     * @return JSON
     */
    public function getLastTweetsForUser($userId, $tweetsLimit = 5)
    {
        $getfield = '?user_id=' . (int) $userId
                . '&count=5';
        
        return parent::setGetfield($getfield)
                ->buildOauth($this->TwitterApiLinks->getTweets, 'GET')
                ->performRequest();
    }
}

class TwitterExtendedException extends Exception {};

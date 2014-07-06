
/**
 * Class to handle connecting to Twitter and gettering user data.
 * @returns {TwitterUser}
 */
var TwitterUser = function(){};

/**
 * Stores list of matched user by entered username.
 * @type Array
 */
TwitterUser.prototype.showList = [];
/**
 * Stores selected from list user data.
 * @type JSON Object
 */
TwitterUser.prototype.SelectedUser = {};

/**
 * Fills show list with users data.
 * @param {JSON} Users
 */
TwitterUser.prototype.addUsersToShowList = function(Users)
{
    TwitterUser.prototype.showList = Users;
};

/**
 * Displays user latest tweets.
 */
TwitterUser.prototype.showUserLatestTweets = function()
{
    var SelectedUserTweetsDiv = $('#selectedUserTweets__tweets').html('');
    SelectedUserTweetsDiv.html(
        '<div class="text-center">Loading tweets<br/><img src="../img/loader.gif" alt="waiting for tweets" /></div>'
    );
    
    $.ajax({
        url : './ajax/twitter_request_router.php',
        type : 'POST',
        dataType : 'text',
        data : 'gate=get-tweets&user_id=' + TwitterUser.prototype.SelectedUser.id,
        success : function(data, status) {
            var UserTweets = $.parseJSON(data);
            
            SelectedUserTweetsDiv.html('');
            for (i in UserTweets) {
                $('<div class="bs-callout bs-callout-spaced bs-callout-info"><h4>'
                    + UserTweets[i].text + '</h4>'
                    + '<p class="text-right"><small>Retweeted: <strong>' + UserTweets[i].retweet_count
                    + '</strong> times</small></p></div>'
                ).appendTo(SelectedUserTweetsDiv);
            }
        },
        error : function(xhr, status, error) {
            var Model = $('#twitterModalWindow');
            Model
                .find('div.modal-body')
                .html('<strong>' + status + ':</strong> ' + error);
            Model.modal('show');
        }
    });
};

/**
 * Displays selected user data.
 */
TwitterUser.prototype.displaySelectedUser = function()
{
    var UserDataDiv = $('#selectedUserData');
    // fill picture and names
    UserDataDiv
        .find('#picture > img')
        .attr('src', this.SelectedUser.profile_image_url)
        .attr('alt', this.SelectedUser.name);
    UserDataDiv
        .find('#name > h4')
        .html('<big>' + this.SelectedUser.name + '</big><br /><small>@' + this.SelectedUser.screen_name + '</small>');
    
    // fill stats
    UserDataDiv
        .find('#followers > h4')
        .text(this.SelectedUser.followers_count);
    UserDataDiv
        .find('#following > h4')
        .text(this.SelectedUser.friends_count);
    UserDataDiv
        .find('#tweets > h4')
        .text(this.SelectedUser.statuses_count);

    // show whole user div
    $('#user')
        .removeClass('hidden')
        .show();
};

/**
 * Handler for selecting user from displayed list.
 * Shows user data and tweets.
 * 
 * @see TwitterUser.prototype.SelectedUser = Event.data;
 * @see TwitterUser.prototype.displaySelectedUser()
 * @see TwitterUser.prototype.showUserLatestTweets();
 * 
 * @param {click} Event
 */
TwitterUser.prototype.selectUser = function(Event)
{
    TwitterUser.prototype.SelectedUser = Event.data;
    $('#users-list.dropdown').attr('class', 'dropdown'); // hide list
    TwitterUser.prototype.displaySelectedUser();
    TwitterUser.prototype.showUserLatestTweets();
};

/**
 * Displays list of found users matched to username entered.
 * @param {JSON} Users
 */
TwitterUser.prototype.displayUsersToChoose = function(Users)
{
    this.addUsersToShowList(Users);
    
    var UsersListDiv = $('#users-list.dropdown');
    UsersListDiv.attr('class', 'dropdown'); // hide list
    
    var UsersListUserLi = UsersListDiv.find('ul > li').first();
    UsersListDiv
        .find('ul')
        .empty()
        .html('<li>' + UsersListUserLi.html() + '</li>');
    
    for (i in this.showList) {
        $('#users-list.dropdown > ul > li')
            .last()
            .after(
                $('<li role="presentation" class="divider"></li>'
                    + '<li><div class="row"><div class="col-sm-4 pull-left text-center">'
                    + '<img src="' + this.showList[i].profile_image_url + '" alt="' + this.showList[i].name + '" class="img-circle" />'
                    + '</div><div class="col-sm-8 pull-left">'
                    + '<h4>' + this.showList[i].name + '<br /><small>@' + this.showList[i].screen_name
                    + '</small></h4></div></div></li>'
                ).click(this.showList[i], TwitterUser.prototype.selectUser)
            );
    }
    
    $('#users-list').attr('class', 'dropdown open');
};


/**
 * Binding handlers to DOM elements.
 */
$(document).ready(function() {
    var TwitterUserObj = new TwitterUser;
    
    /**
     * Search button action
     */
    var SearchButton = $('#go-find-user');
    SearchButton.click(function(Event) {
        Event.preventDefault();
        
        $('#users-list.dropdown').attr('class', 'dropdown');
        
        var TwitterNameInput = $('#twitter-name');
        var twitterUsername = TwitterNameInput.val();
        
        if (twitterUsername == '') {
            var Model = $('#twitterModalWindow');
            Model
                .find('div.modal-body')
                .html('<strong>Enter some username!</strong>');
            Model.modal('show');
            return false;
        }
        
        TwitterNameInput
            .css('background', 'url(../img/loader.gif) no-repeat scroll 0px 6px')
            .css('padding-left', '35px')
            .attr('disabled', 'disabled');
        
        $.ajax({
            url : './ajax/twitter_request_router.php',
            type : 'POST',
            dataType : 'text',
            data : 'gate=get-user&username=' + twitterUsername,
            success : function(data, status) {
                TwitterNameInput
                    .removeAttr('style')
                    .removeAttr('disabled');
                
                TwitterUserObj.displayUsersToChoose($.parseJSON(data));
            },
            error : function(xhr, status, error) {
                if (xhr.responseText !== '') {
                    error = xhr.responseText;
                }
                
                TwitterNameInput
                    .removeAttr('style')
                    .removeAttr('disabled');
                
                var Model = $('#twitterModalWindow');
                Model
                    .find('div.modal-body')
                    .html('<strong>' + status + ':</strong> ' + error);
                Model.modal('show');
            }
        });
    });
    
    /**
     * Form submit action
     * @see SearchButton.click()
     */
    $('form').submit(function(Event) {
        Event.preventDefault();
        SearchButton.click();
    });
});

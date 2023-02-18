"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// StoryIdEdit will be used for grabbing id for each story that needs editing
let storyIdEdit;


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *  * - showDeleteBtn: show delete button?
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {

  const hostName = story.getHostName();

    // if a user is logged in, show favorite/not-favorite star, edit button and trash can for deletion
  
  const showStarEditTrash = Boolean(currentUser);
 

 // if a user is logged in, show edit, trash and edit button 

  return $(`
      <li id="${story.storyId}">
      ${showStarEditTrash ? getTrashCan(story, currentUser): ""}
    ${showStarEditTrash  ? getStarHTML(story, currentUser) : ""}
      ${showStarEditTrash ? getPencil(story, currentUser) : ""}
    <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Make favorite/not-favorite star for story */

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

/** Make delete button HTML for story */
function getTrashCan(story, user){
  const isOwnStory = user.isOwnStory(story);
const addTrash = isOwnStory? `<span class="trash-can"><i class="fas fa-trash-alt"></i></span>` : "";
return   addTrash
}

/** Make edit button HTML for story */
function getPencil(story, user){
const isOwnStory = user.isOwnStory(story);
const addPencil = isOwnStory? `<i class="fas fa-edit"></i>` : "";
return addPencil;
}

/** Handle favorite/un-favorite a story */

async function favStory(evt){
  console.debug("favStory");
  const $picked = $(evt.target);
  const $pickedFav = $picked.closest("li");
  const pickedId = $pickedFav.attr("id");
  const story = storyList.stories.find(s => s.storyId === pickedId )
 
  if($picked.hasClass('fas')){
    await currentUser.removeFavorite(story);
$picked.closest('i').toggleClass('fas far');
}
    else {
      await currentUser.addFavorite(story);
      $picked.closest('i').toggleClass('fas far');
    }

// re-generate story list spontaneously on favortie list page

if($favoritedStories.is(":visible")) {
putFavoritesListOnPage();
}
return

}
$body.on("click", ".star", favStory);


/** Handle deleting a story. */

async function deleteStory(evt) {
  console.debug("deleteStory");
const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
await storyList.removeStory(currentUser, storyId);

// re-generate story list spontaneously depends on which list is showing
if($ownStories.is(":visible")){
    putUserStoriesOnPage();
}
else if($favoritedStories.is(":visible")) {
putFavoritesListOnPage();
}
else  {
putStoriesOnPage();
}
}

$body.on("click",".trash-can", deleteStory);



/** Handle filling new story form. */
function fillStory() {
  console.debug("fillStory")
  hidePageComponents();
  
  $storyForm.show();
}

$("#nav-story").on("click", fillStory);

/** Handle submitting new story form. */
async function submitStory(evt){
  console.debug("submitStory");
  evt.preventDefault();
// grab all info from form
const title = $("#title").val();
const author = $("#author").val();
const url = $("#url").val();
const userName = currentUser.username;
const data = {author, title, url, userName};

//storyList is an array, and an instance of Object StoryList 

const story = await storyList.addStory(currentUser, data);
const $story = generateStoryMarkup(story);
$allStoriesList.prepend($story);
// hide the form and reset it

$storyForm.trigger("reset");
navAllStories();
}

$storyForm.on("submit", submitStory);


/** Handle editing a story  furhter work underway*/
async function editStory(evt){

  console.debug('editStory');
  const $storyIdToEdit = evt.target.closest('li').id;
  storyIdEdit = $storyIdToEdit;
  const story = storyList.stories.find(s => s.storyId === storyIdEdit );
  
  
  hidePageComponents();
  $("#story-edit-form").show();
  $("#story-edit-form").find("#author1").val(`${story.author}`);
  $("#story-edit-form").find("#title1").val(`${story.title}`);
  $("#story-edit-form").find("#url1").val(`${story.url}`);
  
  }
  $body.on("click",".fa-edit", editStory)

  async function submitEdit(evt){
    console.debug("submitEdit");
    evt.preventDefault();
    hidePageComponents();
   
    // grab all info from form
  const title = $("#title1").val();
  const author = $("#author1").val();
  const url = $("#url1").val();
   await storyList.updateStory(currentUser, {author, title, url},storyIdEdit);
   await getAndShowStoriesOnStart();
  }
  
  $("#story-edit-form").on("submit", submitEdit)




/******************************************************************************
 * Functionality for list of user's own stories
 */

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}


// * Functionality for favorites list and starr/un-starr a story
// */

/** Put favorites list on page. */

function putFavoritesListOnPage() {
 console.debug("putFavoritesListOnPage");

 $favoritedStories.empty();

 if (currentUser.favorites.length === 0) {
   $favoritedStories.append("<h5>No favorites added!</h5>");
 } else {
   // loop through all of users favorites and generate HTML for them
   for (let story of currentUser.favorites) {
     const $story = generateStoryMarkup(story);
     $favoritedStories.append($story);
   }
 }

 $favoritedStories.show();
}









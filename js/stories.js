"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">

      <span class="star">
      <i class="fa-star far"></i>
      </span>
    
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



function fillStory() {
  hidePageComponents();
  
  $storyForm.show();
  
  
}


$body.on("click", "#nav-story", fillStory);

//waiting to be debugged

async function submitStory(){
const title = $("#title").val();
const author = $("#author").val();
const url = $("#url").val();
// const userName = currentUser.username;
const data = {author, title, url};

const newStory = await StoryList.addStory(currentUser,data);
console.log(newStory);

}

$storyForm.on("submit", submitStory)

function favStory(evt){

//   console.log(evt.target.parentElement.parentElement);
  const pickedFavId = evt.target.parentElement.parentElement.id;
// //  currentUser.favorites.push("")
//   console.log(evt.target.parentElement);
  console.log(pickedFavId);
  currentUser.favorites.push(pickedFavId);
 

  // $(this).find('.fa-star').toggleClass('fas far');
}


$body.on("click", $star, favStory)

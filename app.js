const BASE_URL =
  "https://strangers-things.herokuapp.com/api/2102-CPU-RM-WEB-PT";
let loginClick = false;
let signClick  = false;

// C R U D
// Create Posts
const createPost = async (postObject) => {
  //console.log(postObject);
  const token = fetchToken();
  if (token) {
    try {
      const response = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postObject),
      });
      const newPost = await response.json();
      return newPost;
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
    //console.log("please log in or register")
  }
};

// Read Posts
const fetchPosts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/posts`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Edit - Update Posts
const updatePost = async (postId, updatedPost) => {
  const token = fetchToken();
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedPost),
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Delete Posts
const deletePost = async (postId) => {
  const token = fetchToken();

  if (token) {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};

// Fetching logged user's relevant data
const fetchUserData = async () => {
  const token = fetchToken();
  if (token) {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      console.log(result.data);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
};

// AUTHENTICATION

//Fetch a token from local Storage
const fetchToken = () => {
  const token = JSON.parse(localStorage.getItem("token"));
  return token ? token : console.log("Please Register or Log in");
};

// Register a new User
const registerUser = async (userName, password) => {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      body: JSON.stringify({
        user: {
          username: userName,
          password: password,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const {
      data: { token },
    } = await response.json();
    //console.log(data)
    localStorage.setItem("token", JSON.stringify(token));
    hideRegistration();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Log an existing User
const loginUser = async (userName, password) => {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      body: JSON.stringify({
        user: {
          username: userName,
          password: password,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const {
      data: { token },
    } = await response.json();

    localStorage.setItem("token", JSON.stringify(token));
    hideRegistration();
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// When existing users logs in, the authentication form disapears and post form appears
const hideRegistration = () => {
  const token = fetchToken();

  if (token) {
    $("#registration").css("display", "none");

    $("#post-form").css("visibility", "visible");
    $("#post-form").removeClass("disabled");
    $("#post-form").removeClass("disabled");

    $("#allMesgs-headerBtn").removeClass('disabled')
    $("#allMesgs-headerBtn").css("visibility", "visible");
    $("#allMesgs-headerBtn").attr("data-bs-toggle",'modal');
    fetchAndRender();
  } else {
    $("#post-form").css("visibility", "hidden");
    $("#post-form").addClass("disabled");
    
    $("#allMesgs-headerBtn").css("visibility", "hidden");
    $("#allMesgs-headerBtn").addClass('disabled')
    $("#allMesgs-headerBtn").removeAttr("data-bs-toggle");
    
    fetchAndRender();
  }
};

// When a logged user logs off, the post form disapear and the authentication form appears
function showHomePage() {
  $("#registration").css("display", "inline");
  $("#post-form").css("visibility", "hidden");
  $("#post-form").addClass("disabled");
  $("#allMesgs-headerBtn").addClass('disabled')
  fetchAndRender();
}

// API call to create a message for a post whose _id is equal to POST_ID
const sendMessage = async (messageData, postId) => {
  const {
    post: { _id },
  } = postId;

  const token = fetchToken();
  try {
    const response = await fetch(`${BASE_URL}/posts/${_id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//RENDERING

//fetch posts and logged user relevant data and call render function
const fetchAndRender = async () => {
  const posts = await fetchPosts();
  const userData = await fetchUserData();

  renderPost(userData, posts.data.posts);
};

//Receives objects from event handler, calls the render function and appends a post/card to HTML
const renderPost = (userData, posts) => {
  console.log(posts)
  $(".cards-div").empty();
  posts.forEach((post) => {
    const postElem = createPostHtml(userData, post);
    $(".cards-div").append(postElem);
  });
};

//Creates html element of a post/card with relevant info fetched from API call
function createPostHtml(userData, post) {
  const token = fetchToken();

  const {
    title,
    description,
    price,
    author: { username, _id },
  } = post;

  return $(`
      <div class="card" >
          <div class="card-body"  >
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <p class="card-text"><span class="badge bg-primary"><span>$</span>${price}</span></p>
            <p class="card-text"><b>${username}</b></p>
            
              ${
                token
                  ? userData.data._id === _id
                    ? `
                  <div class="btn-group" role="group" aria-label="Basic outlined example">
                  <button id="btn-delete" class="btn btn-primary">Delete</button>
                  <button id="btn-edit" class="btn btn-primary">Edit</button>    
                  <button id="btn-seeMessages" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">See Messages</button>
                  </div>
                       `
                    : `<div class="btn-group" role="group" aria-label="Basic outlined example">
                  <button id="btn-sendMessage" class="btn btn-primary">Send a Message</button> 
                  </div>`
                  : ""
              }
          </div>
    </div> `).data("post", post);
}

//Creates html element of a message with relevant info fetched from API call
const renderMessages = ({ messages } = post) => {
  console.log(messages);
  $(".modal-body").empty();

  if (messages.length === 0)
    return $(".modal-body").append("<h5>No Messages To Show</h5>");

  messages.forEach((message) => {
    const messageElem = createMessageHtml(message);

    $(".modal-body").append(messageElem);
  });
};


//Creates html element for all messages an registered user has received
const renderAllMessages = ( messages ) => {
  $(".modal-body").empty();
 
   console.log(messages);

  if (messages.length === 0) return $(".modal-body").append("<h5>No Messages To Show</h5>");
    messages.forEach((message) => {
    const messageElem = createMessageHtml(message);
    $(".modal-body").append(messageElem);
  });
};

//Creates html element of a message with relevant info fetched from API call
const createMessageHtml = (message) => {
  const {
    content,
    fromUser: { username },
  } = message;

  return $(`
    <div class="message">
     <h5 class="message-fromUser">From ${username}:</h5>
         <p class="card-desc">${content}</p>
   </div>
   <hr>
    `);
};

//EVENT HANDLERS

// REGISTRATION FORM
// Gets the ID for the login button in the registration form
$("#registration").on("click", (event) => {
  const idBtn = event.target.id;
  if(idBtn === "login") return loginClick = true
  if(idBtn === "signin") return signClick = true

});

//If the submit in registration from is from the login button then log user with login func, otherwise user register func.
$("#registration").on("submit", (event) => {
  event.preventDefault();
  
  const username = $("#exampleInputUsername").val().trim();
  const password = $("#exampleInputPassword").val().trim();
  
  if(loginClick){
    loginUser(username, password);
    signClick = false;
  } 
  
  if(signClick){
    registerUser(username, password);
    loginClick = false;
  }

  $("#exampleInputUsername").val(null);
  $("#exampleInputPassword").val(null);
});

//POST FORM
//if cancel button is clicked sets the inputs to empty.
$("#cancelPost-btn").on("click", (event) => {
  event.preventDefault();
  $("#post-title").val("");
  $("#post-body").val("");
  $("#post-price").val("");
});

//when post form is submited edit a post if there is a card.data attached to the form, otherwise create a new post
$("#post-form").on("submit", async (event) => {
  event.preventDefault();

  const { card } = $("#post-form").data();
  //console.log(card, postElem);
  const postData = {
    post: {
      title: $("#post-title").val(),
      description: $("#post-body").val(),
      price: $("#post-price").val(),
    },
  };

  try {
    if (card) {
      //editing
      console.log(card, "editing");

      const result = await updatePost(card.post._id, postData);
      console.log("result is:", result);
      fetchAndRender();
      $("#post-form").data({ card: null, postElem: null });
      $("#post-form").trigger("reset");
    } else {
      // new post
      await createPost(postData);
      fetchAndRender();
      $(".row").trigger("reset");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
});


// event handler managing user interaction with a post card (Delete, Edit, Send Message, See Mesages from a post)
$(".cards-div").on("click", async (event) => {
  const idBtn = event.target.id;
  console.log(idBtn);

  const divCardElem = $(event.target).parent().parent().parent();
  console.log(divCardElem);
  const card = divCardElem.data();
  console.log(card);

  const cardsDivElem = divCardElem.parent();

  if (idBtn === "btn-delete") {
    try {
      await deletePost(card.post._id);
      fetchAndRender();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  if (idBtn === "btn-edit") {
    $("#post-form").data({ card, cardsDivElem });
    $("#post-title").val(card.post.title);
    $("#post-body").val(card.post.description);
    $("#post-price").val(card.post.price);
  }

  if (idBtn === "btn-sendMessage") {
    $("#message-form").data({ card });
    console.log(card);
    
    $(".modal").addClass("open");
    $(".message-label")
      .text(`Your message to: ${card.post.author.username}`)
      .css("font-weight", "Bold");

    $(".card-title-message").text(`${card.post.title}`);
    $(".card-desc-message").text(`${card.post.description}`);
    $(".card-price-message").text(`${card.post.price}`);
  }

  if (idBtn === "btn-seeMessages") {
    const {
      post: { _id },
    } = card;
    try {
      const {
        data: { posts },
      } = await fetchUserData();
      console.log(posts);

      posts.forEach((post) => {
        console.log(post);
        if (post._id === _id) {
          renderMessages(post);
        }
      });
      $("#exampleModal").addClass("open");
    } catch (error) {
      throw error;
    }
  }
});

//Close the modal for send messages
$("#cancel-messageBtn").on("click", () => {
  $(".modal").removeClass("open");
  $("#message-body").val("");
});

//On message-form submit creates a message object and calls sendMessage API call.
$("#message-form").on("submit", async (event) => {
  event.preventDefault();

  const cardId = $("#message-form").data("card");
  console.log(cardId);

  const messageData = {
    message: {
      content: $("#message-body").val(),
    },
  };

  if ($("#message-body").val() === "") return;

  try {
    const result = await sendMessage(messageData, cardId);
    console.log(result);
    $(".modal").removeClass("open");
    $("#message-body").val(null);
  } catch (error) {
    console.log(error);
    throw error;
  }
});

//Helper function that filters posts based on the search val
const queryPosts = (post, searchInput) =>{
  return post.title.toLowerCase().includes(searchInput.toLowerCase()) || post.author.username.toLowerCase().includes(searchInput.toLowerCase()) || post.description.toLowerCase().includes(searchInput.toLowerCase())
}

//Header button to filter posts
$("#Search-headerBtn").on('click', async()=>{
  
  let searchInput = $("#search-bar").val().trim()
  const {data:{posts}} = await fetchPosts()
  const filteredPosts = posts.filter(post => queryPosts(post, searchInput))
  const userData = await fetchUserData();

  renderPost(userData, filteredPosts);
  $('#search-bar').val('')
  
})

//Header Button to get all Messages
$("#allPosts-headerBtn").on('click', async()=>{
  console.log("clicked")
  try{
    fetchAndRender()
  }catch(error){
    throw error
  }
  
})

//Header button to fetch all messages a logged user might receive from all users
$("#allMesgs-headerBtn").on("click", async () => {
  const token = fetchToken()
  if(token){
  try {
    const {
      data: { posts },
    } = await fetchUserData();
    console.log(posts);
    let allMessages = []
    posts.forEach((post) => {
      post.messages.length > 0 && allMessages.push(post.messages);
    });
    renderAllMessages(allMessages.flat())
    $("#exampleModal").addClass("open");
  } catch (error) {
    throw error;
  }
}
});

//Header button to logout
$("#logOut-headerBtn").on("click", () => {
  localStorage.removeItem("token");
  
  showHomePage();
});


//EFI function to start the website cicle
(async () => {
  hideRegistration();
})();

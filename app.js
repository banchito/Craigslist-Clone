const BASE_URL =
  "https://strangers-things.herokuapp.com/api/2102-CPU-RM-WEB-PT";
let loginClick = false;

// Async/Await ES6
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

const fetchUserData = async () => {
  const token = fetchToken();
  try {
    const response = await fetch(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    console.log(result.data);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const fetchAndRender = async () => {
    const posts = await fetchPosts();
    const userData = await fetchUserData();
  
    renderPost(userData, posts.data.posts);
  };

const renderPost = (userData, posts) => {
  $(".cards-div").empty();
  posts.forEach((post) => {
    const postElem = createPostHtml(userData, post);
    $(".cards-div").append(postElem);
  });
};

function createPostHtml(userData, post) {
  const {
    title,
    description,
    price,
    author: { username, _id },
  } = post;

  //   data-id=${_id}
  return $(`
    <div class="card" >
        <div class="card-body"  >
          <h5 class="card-title">${title}</h5>
          <p class="card-text">${description}</p>
          <p class="card-text">${price}</p>
          <p class="card-text"><b>${username}</b></p>
          
            ${
              userData.data._id === _id
                ? `<button id="btn-delete" class="btn btn-primary">Delete</button>
                    <button id="btn-edit" class="btn btn-primary">Edit</button>`
                : '<button id="btn-message" class="btn btn-primary">Send a Message</button> '
            }
        </div>
  </div> `).data("post", post);
}

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

$("#registration").on("click", (event) => {
  const idBtn = event.target.id;
  idBtn === "login" && (loginClick = true);
});

$("#registration").on("submit", (event) => {
  event.preventDefault();
  const username = $("#exampleInputUsername").val().trim();

  const password = $("#exampleInputPassword").val().trim();

  loginClick ? loginUser(username, password) : registerUser(username, password);
});

const fetchToken = () => {
  const token = JSON.parse(localStorage.getItem("token"));
  return token ? token : console.log("Please Register or Log in");
};

const hideRegistration = () => {
  const token = fetchToken();

  if (token) {
    $("#registration").css("display", "none");
    $("#post-form").css("visibility", "visible");
    $("#post-form").removeClass("disabled");
    fetchAndRender();
  } else {
    $("#post-form").css("visibility", "hidden");
    $("#post-form").addClass("disabled");
    fetchAndRender();
  }
};







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

$("#post-form").on("submit", async (event) => {
  event.preventDefault();

  const { card, postElem } = $("#post-form").data();
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

$(".cards-div").on("click", async (event) => {
  const idBtn = event.target.id;

  const parentElem = $(event.target).parent();
  const card = parentElem.parent().data();
  const postElem = parentElem.parent();
  //   console.log(card, postElem);
  //const { post: { _id }} = card;
  //console.log(_id);

  if (idBtn === "btn-delete") {
    // console.log(card);
    try {
      await deletePost(card.post._id);
      fetchAndRender();
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else if (idBtn === "btn-edit") {
    $("#post-form").data({ card, postElem });
    //const data = $("#post-form").data(); //erase lines
    //console.log(data); //erase
    $("#post-title").val(card.post.title);
    $("#post-body").val(card.post.description);
    $("#post-price").val(card.post.price);
  } else if (idBtn === "btn-message") {
    $("#message-form").data({ card });
    //const data = $("#message-form").data(); //erase
    //console.log(data); //erase
    $(".modal").addClass("open");
    $(".message-label")
      .text(`Your message to: ${card.post.author.username}`)
      .css("font-weight", "Bold");

    $(".card-title").text(`${card.post.title}`);
    $(".card-desc").text(`${card.post.description}`);
    $(".card-price").text(`${card.post.price}`);
  } else {
    return;
  }
});

$("#cancel-messageBtn").on("click", () => {
  $(".modal").removeClass("open");
});

$("#message-form").on("submit", async (event) => {
  event.preventDefault();
  const messageData = {
    message: {
      content: $("#message-body").val(),
    },
  };
  try {
    const result = await sendMessage(messageData);
    console.log(result);
    $(".modal").removeClass("open");
  } catch (error) {
    console.log(error);
    throw error;
  }
});

const sendMessage = async (messageData) => {
  const token = fetchToken();
  try {
    const response = await fetch(
      `${BASE_URL}/posts/607e0b4c2482a300177065c6/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      }
    );
    const result = await response.json();

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// $("#btn-message").on("click", (event)=> {
// const parentElem = $(event.target).parent()
// console.log(parentElem)
// const card = parentElem.parent().data();
// console.log(card)
// });

(async () => {
  hideRegistration();
  //sendMessage()//test call
})();

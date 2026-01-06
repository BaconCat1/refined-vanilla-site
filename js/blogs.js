/**
 * js/blogs.js
 * 
 * Blog post like/dislike functionality with localStorage persistence.
 * Handles user interactions for liking and disliking blog posts.
 * Each blog post should have a container with a data-post-id attribute,
 * and buttons with classes .js-like and .js-dislike for user actions.
 */

document.addEventListener("DOMContentLoaded", () => {
    const voteContainers = document.querySelectorAll("[data-post-id]");
    const STORAGE_PREFIX = "rv_blog_votes_";

    if (voteContainers.length === 0) return;

    voteContainers.forEach((container) => {
        const postId = container.getAttribute("data-post-id");
        if (!postId) return;

        const likeBtn = container.querySelector(".js-like");
        const dislikeBtn = container.querySelector(".js-dislike");

        const storageKey = STORAGE_PREFIX + postId;

        let data;
        try {
            data = JSON.parse(localStorage.getItem(storageKey)) || {
                likes: 0,
                dislikes: 0,
                userAction: null, // "like" | "dislike" | null
            };
        } catch {
            data = { likes: 0, dislikes: 0, userAction: null };
        }

        const save = () => {
            localStorage.setItem(storageKey, JSON.stringify(data));
        };

        const updateUI = () => {
            const likeCountEl = likeBtn ? likeBtn.querySelector("span") : null;
            const dislikeCountEl = dislikeBtn ? dislikeBtn.querySelector("span") : null;

            if (likeCountEl) likeCountEl.textContent = String(data.likes);
            if (dislikeCountEl) dislikeCountEl.textContent = String(data.dislikes);

            if (likeBtn) likeBtn.classList.toggle("is-active", data.userAction === "like");
            if (dislikeBtn) dislikeBtn.classList.toggle("is-active", data.userAction === "dislike");
        };

        const setAction = (action) => {
            if (data.userAction === action) {
                if (action === "like") data.likes = Math.max(0, data.likes - 1);
                if (action === "dislike") data.dislikes = Math.max(0, data.dislikes - 1);
                data.userAction = null;
                save();
                updateUI();
                return;
            }

            if (data.userAction === "like") data.likes = Math.max(0, data.likes - 1);
            if (data.userAction === "dislike") data.dislikes = Math.max(0, data.dislikes - 1);

            if (action === "like") data.likes += 1;
            if (action === "dislike") data.dislikes += 1;

            data.userAction = action;
            save();
            updateUI();
        };

        updateUI();

        if (likeBtn) {
            likeBtn.addEventListener("click", (e) => {
                e.preventDefault();
                setAction("like");
            });
        }

        if (dislikeBtn) {
            dislikeBtn.addEventListener("click", (e) => {
                e.preventDefault();
                setAction("dislike");
            });
        }
    });
});

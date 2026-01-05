/**
 * Blogs JS
 * Handles Like/Dislike logic using localStorage
 */

document.addEventListener('DOMContentLoaded', () => {
    const voteContainers = document.querySelectorAll('[data-post-id]');
    const STORAGE_PREFIX = 'rv_blog_stats_';

    voteContainers.forEach(container => {
        const postId = container.getAttribute('data-post-id');
        const likeBtn = container.querySelector('.js-like');
        const dislikeBtn = container.querySelector('.js-dislike');
        
        // Load data or initialize
        let data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + postId)) || {
            likes: Math.floor(Math.random() * 50) + 10,
            dislikes: Math.floor(Math.random() * 5),
            userAction: null
        };

        const updateUI = () => {
            if(likeBtn) likeBtn.querySelector('span').innerText = data.likes;
            if(dislikeBtn) dislikeBtn.querySelector('span').innerText = data.dislikes;
            
            // Highlight active selection
            if(likeBtn) likeBtn.style.color = data.userAction === 'like' ? '#157A6E' : '';
            if(dislikeBtn) dislikeBtn.style.color = data.userAction === 'dislike' ? '#e74c3c' : '';
        };

        updateUI();

        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (data.userAction === 'like') {
                    data.likes--;
                    data.userAction = null;
                } else {
                    if (data.userAction === 'dislike') data.dislikes--;
                    data.likes++;
                    data.userAction = 'like';
                }
                saveAndRender();
            });
        }

        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (data.userAction === 'dislike') {
                    data.dislikes--;
                    data.userAction = null;
                } else {
                    if (data.userAction === 'like') data.likes--;
                    data.dislikes++;
                    data.userAction = 'dislike';
                }
                saveAndRender();
            });
        }

        const saveAndRender = () => {
            localStorage.setItem(STORAGE_PREFIX + postId, JSON.stringify(data));
            updateUI();
        };
    });
});
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const VELOG_USER_ID = process.env.VELOG_USER_ID;
const POSTS_DIR = 'posts';

async function fetchVelogPosts() {
  const response = await axios.get(`https://v2.velog.io/api/posts/@${VELOG_USER_ID}`);
  return response.data;
}

async function downloadPost(post) {
  const response = await axios.get(`https://v2.velog.io/api/posts/@${VELOG_USER_ID}/${post.url_slug}`);
  return response.data;
}

async function savePost(post) {
  const content = `---
title: ${post.title}
date: ${post.created_at}
tags: ${post.tags.join(', ')}
---
${post.body}`;
  const fileName = `${post.url_slug}.md`;
  const filePath = path.join(POSTS_DIR, fileName);
  await fs.outputFile(filePath, content);
}

async function syncVelogPosts() {
  try {
    const posts = await fetchVelogPosts();
    await fs.ensureDir(POSTS_DIR);
    for (const post of posts) {
      const fullPost = await downloadPost(post);
      await savePost(fullPost);
    }
    console.log('Velog posts synced successfully!');
  } catch (error) {
    console.error('Error syncing Velog posts:', error);
    process.exit(1);
  }
}

syncVelogPosts();

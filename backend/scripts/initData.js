const mongoose = require('mongoose');
const CONFIG = require('../config');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Default admin user 
const defaultAdmin = {
  username: 'Sam',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  donateuser: 'yes',
  createdAt: new Date()
};

// Default regular user
const defaultUser = {
  username: 'John Chen',
  email: 'user@example.com',
  password: 'user123',
  role: 'user',
  donateuser: 'no',
  createdAt: new Date()
};

// Default posts
const defaultPosts = [
  {
    title: "The Rise of Decentralized Finance",
    content: "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. By removing intermediaries like banks and brokers, DeFi empowers individuals to manage their own assets and participate directly in financial activities without relying on centralized authorities. One of the core innovations of DeFi is the use of smart contracts, which are self-executing agreements with the terms directly written into code. These smart contracts allow DeFi platforms to automate transactions, lending, borrowing, and trading without the need for a trusted third party. As a result, DeFi offers greater transparency, accessibility, and efficiency compared to traditional financial models. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading. Users can earn interest on their crypto assets, take out loans by providing collateral, or even participate in liquidity pools and decentralized exchanges. As DeFi continues to expand, it holds the potential to reshape the financial landscape, making financial services more inclusive and accessible to people around the world.",
    tags: ["Blockchain", "Finance", "Technology"],
    imageUrl: "https://i.imgur.com/B5fQSBP.png"
  },
  {
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content: "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    tags: ["AI", "Business", "Technology"],
    imageUrl: "https://imgur.com/2yCyCSE.png"
  },
  {
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content: "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    tags: ["Environment", "Lifestyle", "Sustainability"],
    imageUrl: "https://imgur.com/X2xtDQn.png"
  },
  {
    title: "Exploring the Wonders of Deep Sea",
    content: "The deep sea is the lowest layer in the ocean, existing below the thermocline and above the seabed, at a depth of 1000 fathoms or more. Little or no light penetrates this part of the ocean and most of the organisms that live there rely on falling organic matter produced in the photic zone.",
    tags: ["Oceanography", "Marine Biology", "Exploration"],
    imageUrl: "https://imgur.com/1alsdgt.png"
  },
  {
    title: "The Future of Remote Work",
    content: "Remote work has seen a significant surge in recent years, accelerated by global events. This shift is reshaping how companies operate and how employees balance work and life. What does the future hold for remote work? This article explores the trends, benefits, and challenges.",
    tags: ["Work", "Future", "Technology", "Lifestyle"],
    imageUrl: "https://imgur.com/SngIAJi.png"
  },
  {
    title: "Understanding Quantum Computing",
    content: "Quantum computing is a new kind of computing that uses the principles of quantum mechanics to solve complex problems that are beyond the capabilities of classical computers. It has the potential to revolutionize fields like medicine, materials science, and artificial intelligence.",
    tags: ["Quantum Computing", "Technology", "Science"],
    imageUrl: "https://imgur.com/mSZb2OK.png"
  },
  {
    title: "A Guide to Mindful Meditation",
    content: "Mindful meditation is a practice that helps you focus on the present moment, reducing stress and improving overall well-being. This guide provides simple steps to start your meditation journey and experience its benefits.",
    tags: ["Mindfulness", "Meditation", "Health", "Lifestyle"],
    imageUrl: "https://imgur.com/FPMxCBN.png"
  },
  {
    title: "The Art of Storytelling in Marketing",
    content: "Storytelling is a powerful tool in marketing. It helps create an emotional connection with the audience, making brands more memorable and relatable. Learn how to craft compelling narratives that resonate with your customers.",
    tags: ["Marketing", "Business", "Storytelling"],
    imageUrl: "https://imgur.com/FAWfMWl.png"
  },
  {
    title: "Renewable Energy Sources: A Comprehensive Overview",
    content: "Renewable energy sources like solar, wind, and hydro are crucial for a sustainable future. This article provides a comprehensive overview of different types of renewable energy, their advantages, and their role in combating climate change.",
    tags: ["Renewable Energy", "Environment", "Sustainability", "Technology"],
    imageUrl: "https://imgur.com/siVcbbW.png"
  },
  {
    title: "Beginner's Guide to Learning Python",
    content: "Python is a versatile and widely-used programming language, known for its readability and extensive libraries. This beginner's guide will help you get started with Python, covering the basics and pointing you to further resources.",
    tags: ["Programming", "Python", "Technology", "Education"],
    imageUrl: "https://imgur.com/P10XHAt.png"
  }
];

async function initData() {
  try {
    console.log('Starting data initialization...');

    let adminUser;
    
    // Check whether an admin user already exists
    console.log('Checking admin user...');
    const existingAdmin = await User.findOne({ email: defaultAdmin.email });
    console.log('Existing admin user:', existingAdmin ? 'exists' : 'does not exist');
    
    if (!existingAdmin) {
      console.log('Creating new admin user...');
      // Create admin user
      adminUser = new User({
        username: defaultAdmin.username,
        email: defaultAdmin.email,
        password: defaultAdmin.password,
        role: defaultAdmin.role,
        donateuser: defaultAdmin.donateuser,
        createdAt: defaultAdmin.createdAt
      });
      await adminUser.save();
      console.log('Admin user created successfully:', {
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        donateuser: adminUser.donateuser
      });
    } else {
      adminUser = existingAdmin;
      if (adminUser.username !== defaultAdmin.username) {
        console.log(`Updating existing admin username from ${adminUser.username} to ${defaultAdmin.username}...`);
        adminUser.username = defaultAdmin.username;
        await adminUser.save();
        console.log('Admin username updated successfully.');
      }
      console.log('Using existing admin user:', {
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role
      });
    }

    // Create or fetch a regular user (commenter)
    let commentingUser;
    console.log('Checking regular user (commenter)...');
    const existingCommentingUser = await User.findOne({ email: defaultUser.email });
    if (!existingCommentingUser) {
      console.log('Creating new regular user (commenter)...');
      commentingUser = new User({
        username: defaultUser.username,
        email: defaultUser.email,
        password: defaultUser.password, // Password will be hashed automatically
        role: defaultUser.role,
        donateuser: defaultUser.donateuser,
        createdAt: defaultUser.createdAt
      });
      await commentingUser.save();
      console.log('Regular user (commenter) created successfully:', { id: commentingUser._id, username: commentingUser.username });
    } else {
      commentingUser = existingCommentingUser;
      console.log('Using existing regular user (commenter):', { id: commentingUser._id, username: commentingUser.username });
    }

    // Only seed demo posts/comments the very first time the database is empty.
    // IMPORTANT: this used to unconditionally wipe *all* posts/comments on every
    // server start, which would destroy real user-generated content on restart.
    // Now we only seed when there are no posts at all yet (fresh database).
    const existingPostCount = await Post.countDocuments({});
    if (existingPostCount > 0) {
      console.log(`Found ${existingPostCount} existing post(s); skipping demo data seeding to avoid data loss.`);
      console.log('Data initialization completed');
      return;
    }

    // Create demo posts (only runs on a fresh/empty database)
    console.log('No existing posts found. Seeding demo posts...');
    const createdPosts = []; // Store created posts
    for (const postData of defaultPosts) {
      const post = new Post({
        ...postData,
        author: adminUser._id, // All posts are created by the admin
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await post.save();
      createdPosts.push(post); // Add created post to the list
      console.log(`Post created successfully: ${post.title} (ID: ${post._id})`);
    }
    console.log(`${createdPosts.length} posts created.`);

    // Add comments to 5 random posts (if posts and user exist)
    if (commentingUser && createdPosts.length > 0) {
      console.log(`Starting to add comments for ${commentingUser.username}...`);
      const postsToCommentOn = [...createdPosts].sort(() => 0.5 - Math.random()).slice(0, 5);
      let commentsAddedCount = 0;

      if (postsToCommentOn.length > 0) {
        for (const post of postsToCommentOn) {
          const sampleComments = [
            "Great article, very insightful!",
            "Thanks for sharing this.",
            "I have a question about this part...",
            "Really enjoyed reading this post.",
            "This is exactly what I was looking for.",
            "Could you elaborate more on the first point?",
            "Helpful information, thank you!",
            "Well written and easy to understand.",
            "Looking forward to more content like this.",
            "I agree with most of your points."
          ];
          const randomCommentContent = sampleComments[Math.floor(Math.random() * sampleComments.length)];
          
          const newComment = new Comment({
            postId: post._id,
            user: commentingUser._id,
            content: randomCommentContent,
            isPublic: true, // Ensure comment is public
            createdAt: new Date()
          });
          await newComment.save();
          commentsAddedCount++;
          console.log(`Added comment to post "${post.title}": "${randomCommentContent}"`);
        }
        console.log(`${commentingUser.username} successfully added ${commentsAddedCount} comments.`);
      } else {
        console.log('Not enough posts available to add comments.');
      }
    } else {
      if (!commentingUser) console.log('Commenting user does not exist, skipping comment creation.');
      if (createdPosts.length === 0) console.log('No posts available for comments, skipping comment creation.');
    }

    console.log('Data initialization completed');
  } catch (error) {
    console.error('Error during initialization:', error);
    throw error;
  }
}

// Run initialization when this file is executed directly (not imported)
if (require.main === module) {
  // When running directly, connect to database first
  console.log('Connecting to MongoDB...');
  mongoose.connect(CONFIG.MONGODB_URI)
    .then(async () => {
      console.log('MongoDB connected successfully');
      await initData();
      // Disconnect only when running directly
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    })
    .catch(error => {
      console.error('MongoDB connection failed:', error);
      process.exit(1);
    });
}

// Export initializer so it can be used in app.js
module.exports = initData; 
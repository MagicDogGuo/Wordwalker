export const queryKeys = {
  posts: {
    list: ['posts', 'list'],
    detail: (id) => ['posts', 'detail', id],
    myFavorites: ['posts', 'myFavorites'],
    myPosts: ['posts', 'myPosts'],
    byTag: (tagName) => ['posts', 'byTag', tagName],
    uniqueTags: ['posts', 'uniqueTags']
  },
  comments: {
    byPost: (postId) => ['comments', 'byPost', postId]
  }
};

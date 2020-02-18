  
const {ApolloServer , gql} = require('apollo-server');
// ApolloServer: 讓我們啟動 server 的 class ，不但實作許多 GraphQL 功能
//也提供 web application 的功能 (背後使用 express)
// gql: template literal tag, 讓你在 Javascript 中使用 GraphQL 語法

const typeDefs = gql`
    """
    使用者
    """
    type User{
        "識別碼"
        id:ID!
        "帳號 (預設email)"
        account:String!
        "密碼"
        password:String!
        "年齡"
        age:Int
        "姓名"
        name:String!
        "朋友"
        friends:[User]
        "貼文"
        posts:[Post]
    }

    type Post{
        "識別碼"
        id:ID!
        "標題"
        title:String
        "作者"
        author:User
        "內文"
        content:String
        "按讚者"
        likeGivers:[User]
        "生成時間"
        createdAt:String
    }

    type Query{
        "測試"
        hello:String
        "目前使用者"
        me:User
        "所有使用者"
        users:[User]
        "按名字找特定使用者"
        user(name:String!):User
        "取得所有貼文"
        posts:[Post]
        "按id找特定貼文"
        post(id:ID!):Post
    }

    input UpdateMyInfoInput{
        name:String
        age:int
    }

    input AddPostInput{
        title:String!
        content:String
    }

    type Mutation{
        updateMyInfo(input:UpdateMyInfoInput):User
        addFriend(userId:ID!):User
        addPost(input:AddPostInput!):Post
        likePost(postId:ID!):Post
    }
`;

const meId = 1;
const users = [
    {
        id: 1,
        account: 'fong@test.com',
        password: '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', // 123456
        name: 'Fong',
        age: 23,
        friendIds: [2, 3]
      },
      {
        id: 2,
        account: 'kevin@test.com',
        passwrod: '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', // 123456
        name: 'Kevin',
        age: 40,
        friendIds: [1]
      },
      {
        id: 3,
        account: 'mary@test.com',
        password: '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', // 123456
        name: 'Mary',
        age: 18,
        friendIds: [1]
      }
]

const posts = [
    {
        id: 1,
        authorId: 1,
        title: 'Hello World',
        content: 'This is my first post',
        likeGiverIds: [1, 2],
        createdAt: '2018-10-22T01:40:14.941Z'
      },
      {
        id: 2,
        authorId: 2,
        title: 'Nice Day',
        content: 'Hello My Friend!',
        likeGiverIds: [1],
        createdAt: '2018-10-24T01:40:14.941Z'
      }
];

const findUserByUserId = (userId)=>{
    return users.find(user=>user.id===Number(userId));
}

const filterUsersByUsersId = userIds =>{
    return users.filter(user=>userIds.includes(user.id));
}

const filterPostByUserId = userId =>{
    return posts.filter(post=>post.authorId===userId);
}
const findUserByName = name=>users.find(user=>user.name===name);

const findPostByPostId = postId =>{
    return posts.find(post=>post.id===Number(postId));
}

const updateMyInfo = (userId,data)=>{
    Object.assign(findUserByUserId(userId),data);
}

const addPost = ({authorId,title,content})=>(
    posts[posts.length] = {
        id:posts[posts.length-1].id+1,
        authorId,
        title,
        content,
        likeGivers:[],
        createdAt:new Date().toISOString()
    }
);

const updatePost = (postId,data)=>{
    Object.assign(findPostByPostId(postId),data);
}

const resolvers={
    Query:{
        hello:()=>"world",
        me:()=>findUserByUserId(meId),
        users:()=>users,
        user:(root,{name},context)=>findUserByName(name),
        posts:()=>posts,
        post:(root,{id},context)=>findPostByPostId(id)
    },
    User:{
        friends:(parent,args,context)=>filterUsersByUsersId(parent.friendIds),
        posts:(parent,args,context)=>filterPostByUserId(parent.id)
    },
    Post:{
        author:(parent,args,context)=>findUserByUserId(parent.authorId),
        likeGivers:(parent,args,context)=>filterUsersByUsersId(parent.likeGiverIds)
    },
    Mutation:{
        updateMyInfo:(parent,{input},context)=>{
            const data = ["name","age"].reduce(
                (obj,key)=>(input[key]?{...obj,[key]:input[key]}:obj),{}
            );

            return updateMyInfo(meId,data);
        }
    }
};

// 3. 初始化 Web Server ，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
    typeDefs,resolvers
});

// 4. 啟動 Server
server.listen().then(({url})=>{console.log(`? Server ready at ${url}`)});
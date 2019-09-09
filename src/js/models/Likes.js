export default class Likes {
    constructor() {
        this.likes=[];
    }

    addLike(id,title,author,img){
        const like ={id,title,author,img}
        this.likes.push(like);

        //Perist data in localstorege
        this.parsistData();
        return like;
    }

    deleteLike(id){
        const index = this.likes.findIndex(el=> el.id===id);
        this.likes.splice(index,1);

        this.parsistData();
    }

    isLiked(id){
        return this.likes.findIndex(el=>el.id === id) !== -1;
    }

    getNumLikes(){
        return this.likes.length;
    }

    parsistData(){
        localStorage.setItem('likes',JSON.stringify(this.likes))
    }

    readStorage(){
        const storage = JSON.parse(localStorage.getItem('likes'));

        //restarting likes the localstorage
        if(storage) this.likes = storage;
    }
}
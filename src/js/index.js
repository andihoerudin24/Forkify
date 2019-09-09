import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searcView  from './views/searchView';
import * as recipeView  from './views/recipeView';
import * as listView  from './views/listView';
import * as likesView  from './views/likesView';
import {elements,renderLoader,clearLoader} from './views/base';
import Likes from './models/Likes';

const state ={};

const controlSearch= async ()=>{
    const query = searcView.getInput();
    if(query){
        state.search = new Search(query)
        searcView.clearInput();
        searcView.clearResults();
        renderLoader(elements.searchRes)

        try {
            await state.search.getResults();

            clearLoader();
            searcView.renderResults(state.search.result);
        } catch (error) {
            alert('somethning wrong with the search...')
            clearLoader();
        }


     }
}

elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault();
    controlSearch();
})


elements.searchResPages.addEventListener('click',e=>{
    const btn = e.target.closest('.btn-inline')
    if(btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searcView.clearResults();
        searcView.renderResults(state.search.result,goToPage);

    }
})

const controlRecipe = async ()=>{
    const id= window.location.hash.replace('#','');
    if(id){
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

       if(state.search) searcView.highLightSelected(id);

        state.recipe= new Recipe(id);
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();

            clearLoader();
            recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
        } catch (error) {
            alert('error prosesing recipe');
        }

    }
}
['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));

const controlList = ()=>{
    //create a new list if there in none yet
    if(!state.list) state.list = new List();

    //add each ingredient
    state.recipe.ingredients.forEach(el=>{
       const item= state.list.addItem(el.count,el.unit,el.ingredient);
       listView.renderItem(item);

    })
}

//handel delete and update list item
elements.shopping.addEventListener('click',e=>{
    const id= e.target.closest('.shopping__item').dataset.itemid;

    //handel delete item
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // delete from target
        state.list.deleteItem(id);

        listView.deletItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        const val =parseFloat(e.target.value,10);
        state.list.updateCount(id,val);
    }
});


const controlLike = () =>{
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //user has not like get recipe
    if(!state.likes.isLiked(currentID)){
       //add like to the state
       const newLike = state.likes.addLike(
           currentID,
           state.recipe.title,
           state.recipe.author,
           state.recipe.img
       )
       //toggle the like button
       likesView.toggleLikeBtn(true);
       //add like the ui list
       likesView.renderLike(newLike);

       //user has liked current recipe
    }else{
       //remove like to the state
       state.likes.deleteLike(currentID);
       //toggle the like button

       likesView.toggleLikeBtn(false);
       //remove like the ui list
       likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());

}

//Restor liked
window.addEventListener('load',()=>{
    state.likes = new Likes();

    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //
    state.likes.likes.forEach(like=>likesView.renderLike(like));
})


//handling recipe button click
elements.recipe.addEventListener('click',e =>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked
        if(state.recipe.servings > 1){

            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase button in click
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //likecontroller
        controlLike();
    }
});



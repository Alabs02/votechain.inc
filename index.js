const contractSource = `
  contract MemeVote =
    record meme =
      { creatorAddress : address,
        url            : string,
        name           : string,
        voteCount      : int }
    record state =
      { memes      : map(int, meme),
        memesLength : int }
    entrypoint init() =
      { memes = {},
        memesLength = 0 }
    entrypoint getMeme(index : int) : meme =
      switch(Map.lookup(index, state.memes))
        None    => abort("There was no meme with this index registered.")
        Some(x) => x
    stateful entrypoint registerMeme(url' : string, name' : string) =
      let meme = { creatorAddress = Call.caller, url = url', name = name', voteCount = 0}
      let index = getMemesLength() + 1
      put(state{ memes[index] = meme, memesLength = index })
    entrypoint getMemesLength() : int =
      state.memesLength
    stateful entrypoint voteMeme(index : int) =
      let meme = getMeme(index)
      Chain.spend(meme.creatorAddress, Call.value)
      let updatedVoteCount = meme.voteCount + Call.value
      let updatedMemes = state.memes{ [index].voteCount = updatedVoteCount }
      put(state{ memes = updatedMemes })
`;
const contractAddress = 'ct_GAW2b4KKFhJ73ZW4zmHaX2UxyFuMdg99rt8byxsm8pNM1AWi5';
var client = null;
var memeArray = [];
var memesLenght = 0;

function renderMemes() {
    memeArray = memeArray.sort(function(a, b){return b.votes-a.votes})
    var template = $('#template').html();
    Mustache.parse(template);
    var reandered = Mustache.render(template, {memeArray});
    $('#memeBody').html(reandered);
}

window.addEventListener('load', async () => {

  client = await Ae.Aepp();

  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call('getMemesLength', [], {callStatic: true}).catch(e => console.error(e));
  console.log('calledGet', calledGet);

  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log('decodedGet', decodedGet);

  renderMemes();
})

   jQuery('#memeBody').on("click", ".vote-btn", async function(event){
    const dataIndex = event.target.id;
    const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
    const value = $(".amount")[foundIndex].value;
    console.log("value: ", value);

    memeArray[foundIndex].votes += parseInt(value, 10);
    renderMemes();

   });
   
  
    renderMemes();
  
  
  $('#register-btn').click(async function(){
    var name = ($('#reg-name').val()),
        url = ($('#reg-url').val());
  
    memeArray.push({
      creatorName: name,
      memeUrl: url,
      index: memeArray.length+1,
      votes: 0
    })
    renderMemes();
  });
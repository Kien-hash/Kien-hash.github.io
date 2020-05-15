const socket = io('https://singaling-webrtc026.herokuapp.com/');

$('#div-chat').hide(); 

function openStream() {
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
};

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}


const peer = new Peer();

socket.on('list-User',arrUser =>{
    $('#div-chat').show(); 
    $('#div-signup').hide(); 

    arrUser.forEach(user => {
        const {ten, peerID} = user;
        $('#ulUser').append(`<li id="${peerID}">${ten}</li>`);
    });

    socket.on('has-newUser',user =>{
        const {ten, peerID} = user;
        $('#ulUser').append(`<li id="${peerID}">${ten}</li>`);
    })

    socket.on('someone-disconnect', (peerID) =>{
        $(`#${peerID}`).remove();
        console.log(peerID + ' disconnected')
    });
    
});

socket.on('Signup-Failed', ()=> alert('Please choose another username!!!'));

peer.on('open',(id) => {
    $('#my-peer').append(id);

    $('#btnSignUp').click(()=>{
        const username = $('#txtUsername').val();
        socket.emit('User-sign-up', {ten: username,peerID : id});  
        $('#my-username').append(username);
    });

});

peer.on('call', call =>{
    openStream().then(stream =>{
        call.answer(stream);
        playStream('localStream',stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//openStream().then(stream => playStream('localStream', stream));

$('#ulUser').on('click','li', function(){
    const id = $(this).attr('id');
    openStream().then(stream =>{
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

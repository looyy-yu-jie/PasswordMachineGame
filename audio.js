// 音乐控制相关代码
let isMusicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicOn = document.querySelector('.music-on');
const musicOff = document.querySelector('.music-off');

// 添加音乐播放错误处理
bgMusic.addEventListener('error', (e) => {
    console.error('音频加载失败:', e);
    customAlert("背景音乐加载失败");
});

// 音乐控制按钮点击事件
musicToggle.addEventListener('click', () => {
    try {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicOn.style.display = 'none';
            musicOff.style.display = 'inline';
        } else {
            const playPromise = bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    musicOn.style.display = 'inline';
                    musicOff.style.display = 'none';
                }).catch(error => {
                    console.error('播放失败:', error);
                    customAlert("无法播放音乐，请检查浏览器设置");
                });
            }
        }
        isMusicPlaying = !isMusicPlaying;
    } catch (error) {
        console.error('音乐控制错误:', error);
        customAlert("音乐播放出现问题");
    }
});

// 页面加载完成后尝试播放音乐
window.addEventListener('load', () => {
    try {
        bgMusic.volume = 0.5; // 设置音量为50%
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                musicOn.style.display = 'inline';
                musicOff.style.display = 'none';
            }).catch(error => {
                console.log('自动播放被阻止，等待用户交互');
                isMusicPlaying = false;
                musicOn.style.display = 'none';
                musicOff.style.display = 'inline';
            });
        }
    } catch (error) {
        console.error('初始化音乐失败:', error);
    }
});

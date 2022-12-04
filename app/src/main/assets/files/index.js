let baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8089" : "";

function actionRename(value) {
    const customDialogRename = document.createElement('custom-dialog-rename');
    customDialogRename.setAttribute('value', value || '');
    document.body.appendChild(customDialogRename);
    customDialogRename.addEventListener('submit', async evt => {
        evt.stopPropagation();
        let path = (new URL(document.URL).searchParams.get('path') || '') + "/" + value;
        await fetch(`/api/rename?src=${encodeURIComponent(path)}&dst=${encodeURIComponent(evt.detail)}`);
        location.reload();
    });
}
async function loadFiles() {
    const res = await fetch(`${baseUri}/api/files?path=${new URL(window.location).searchParams.get("path") || ''}`);
    const files = await res.json();
    return files;
}
async function render(sort) {

    let files = await loadFiles();
    if (!files) return;
    const container = document.querySelector('div');

    container.innerHTML = '';
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            // Each entry describes an intersection change for one observed
            // target element:
            //   entry.boundingClientRect
            //   entry.intersectionRatio
            //   entry.intersectionRect
            //   entry.isIntersecting
            //   entry.rootBounds
            //   entry.target
            //   entry.time
            if (entry.isIntersecting) {
                if (entry.target.getAttribute('data-src'))
                    entry.target.setAttribute('src', entry.target.getAttribute('data-src'));
                io.unobserve(entry.target)
            }
        });
    });


    files = files.sort((x, y) => {
        if (x.isDir === y.isDir) {
            if (sort === 1) {
                console.log(x.name, y.name)
                return x.name.localeCompare(y.name);
            } else if (sort === 2) {
                return y.length - x.length;
            } else {
                return y.lastModified - x.lastModified;
            }
        } else if (x.isDir)
            return -1;
        else
            return 1;
    })

    files.forEach(element => {
        const customMediaItem = document.createElement('custom-media-item');
        if (element.isDir)
            customMediaItem.setAttribute('src', "icon-folder-m.svg");
        else if (/\.(?:apk|pdf|zip|txt)$/.test(element.name)) {

            customMediaItem.setAttribute('src', `icon-${/\.(apk|pdf|zip|txt)$/.exec(element.name)[1]}-m.svg`);
        } else if (/\.(?:jpg|png|svg)$/.test(element.name)) {
            customMediaItem.setAttribute('src', `icon-pic-m.svg`);
            customMediaItem.setAttribute('data-src', `${baseUri}/api/files?path=${encodeURIComponent(element.parent + "/" + element.name)}&isDir=0`);
        } else if (element.name.endsWith('.xlsx')) {
            customMediaItem.setAttribute('src', `icon-xls-m.svg`);
        } else if (element.name.endsWith('.7z')) {
            customMediaItem.setAttribute('src', `icon-zip-m.svg`);
        } else if (/\.(?:txt|epub|azw3|mobi)$/.test(element.name)) {
            customMediaItem.setAttribute('src', `icon-txt-m.svg`);
        } else if (/\.(?:htm|xhtml|html)$/.test(element.name)) {
            customMediaItem.setAttribute('src', `icon-code-m.svg`);
        } else if (/\.(?:mp3)$/.test(element.name)) {
            customMediaItem.setAttribute('src', `icon-audio-m.svg`);
        } else if (/\.(?:mp4)$/.test(element.name)) {
            customMediaItem.setAttribute('src', `icon-video-m.svg`);
            customMediaItem.setAttribute('data-src', `${baseUri}/api/files?action=preview&path=${encodeURIComponent(element.parent + "/" + element.name)}`);
        } else {
            customMediaItem.setAttribute('src', "icon-nor-m.svg");
        }
        customMediaItem.setAttribute('title', element.name);
        let path;
        if (element.isDir) {
            path = `?path=${encodeURIComponent(element.parent + "/" + element.name)}&isDir=${element.isDir ? 1 : 0}`;
        } else {
            path = `${baseUri}/api/files?path=${encodeURIComponent(element.parent + "/" + element.name)}&isDir=${element.isDir ? 1 : 0}`;
        }
        customMediaItem.setAttribute('href', path);
        customMediaItem.setAttribute('data-path', element.parent + "/" + element.name);
        if (!element.isDir)
            customMediaItem.setAttribute('subhead', humanFileSize(element.length))
        container.appendChild(customMediaItem);
        customMediaItem.addEventListener('submit', evt => {

            customMediaItem.setAttribute('checked', 'true');
            const customBottomSheet = document.createElement('custom-bottom-sheet');
            document.body.appendChild(customBottomSheet);
            customBottomSheet.dataset.path = `?path=${encodeURIComponent(element.parent + "/" + element.name)}&isDir=${element.isDir ? 1 : 0}`;

            if (/\.(?:mp4|mp3)$/.test(element.name)) {
                customBottomSheet.appendPlayButton();
            } else if (element.isDir) {
                customBottomSheet.appendFavorite();
            }
            customBottomSheet.addEventListener('delete', async evt => {
                customBottomSheet.remove();
                // const customDialog = document.createElement('custom-dialog');
                // customDialog.setAttribute('title', "询问");
                // const path = evt.currentTarget.dataset.path;
                // let name = substringBeforeLast(path, "&");
                // const elements = [...document.querySelectorAll('[data-active]')];
                // customDialog.setAttribute('message', `您确定要删除 ${elements.map(x => substringAfterLast(x.dataset.path, "/"))} 吗？`);
                // customDialog.addEventListener('submit', async evt => {
                //     customDialog.remove();

                //     await fetch(`${baseUri}/api/delete`, {
                //         method: 'POST',
                //         body: JSON.stringify(elements.map(x => x.dataset.path))
                //     });
                //     elements.forEach(x => {
                //         x.remove();
                //     });
                // });
                // document.body.appendChild(customDialog);
                const customFiles = document.createElement('custom-files');
                document.body.appendChild(customFiles);
                customFiles.addEventListener('submit', async evt => {
                    evt.stopPropagation();
                    try {
                        await fetch(`${baseUri}/api/delete`, {
                            method: 'POST',
                            body: localStorage.getItem('files')
                        });
                    } catch (error) {

                    }
                    localStorage.setItem('files', '[]')
                    location.reload();
                });
            });
            customBottomSheet.addEventListener('move', async evt => {
                customBottomSheet.remove();
                const customFiles = document.createElement('custom-files');
                document.body.appendChild(customFiles);
                customFiles.addEventListener('submit', async evt => {
                    evt.stopPropagation();
                    try {
                        await fetch(`${baseUri}/api/move?dst=${new URL(window.location).searchParams.get('path')}`, {
                            method: 'POST',
                            body: localStorage.getItem('files')
                        });
                    } catch (error) {

                    }
                    localStorage.setItem('files', '[]')
                    location.reload();
                });
            });
            customBottomSheet.addEventListener('rename', async evt => {
                customBottomSheet.remove();
                actionRename(element.name);
            });
            customBottomSheet.addEventListener('fav', evt => {
                customBottomSheet.remove();
                let parent = new URL(window.location).searchParams.get('path');
                if (!parent) {
                    parent = "/storage/emulated/0";
                    return;
                }
                const paths = JSON.parse(
                    localStorage.getItem('favorites')
                ) || [];
                paths.push(parent + "/" + element.name);
                console.log(paths);
                localStorage.setItem('favorites', JSON.stringify(paths));
            })
        });
        io.observe(customMediaItem)

    });

}
render((localStorage.getItem('sort') && parseInt(localStorage.getItem('sort'))) || 2);


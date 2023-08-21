import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection, FileError } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
import { Card, CardContent } from '@mui/material';
import { Formik, Form } from 'formik';
import { Grid } from '@mui/material';
import { Upload, Button, Space, Typography, Progress, Dragger } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import './Dropzone.css';

// interface used to specify the type, structure and data used for each file 
export interface UploadableFile {
  id: string; // Unique identifier for each file
  file: File;
  errors: FileError[];
  progress: number;
  remaining: number;
  cancelTokenSource: CancelTokenSource | null;
}


function Dropzone() {
  // using react useState hook to store current file state and update to next state
  // destructuring the array, files represents the current state 
  // and setFiles is used to update current state to next state
  const [files, setFiles] = useState<UploadableFile[]>([]);
  // variable used to get the initial time of upload which we will use in the getRemainingTime function
  const uploadStartTime = Date.now();

  // useEffect(() => {
  //   // console.log(files); // log the updated state value
  // }, [files]);

  // an arrow function that generates a unique identifier for each file
  const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // arrow function that calculates remaining time of file upload
  // args: progress which is the current progress of the upload
  // startTime: the start time of upload
  const getRemainingTime = (progress: number, startTime: number) => {
    if (progress <= 0 || progress >= 100) {
      return '0';
    }

    // logic that estimates remaining time of upload
    const elapsedTime = Date.now() - startTime; // how much time passes since we started upload
    const remainingTime = ((100 - progress) / progress) * elapsedTime;
    return Math.ceil(remainingTime / 1000); // Convert to seconds
  };

  // callback function that is invoked when a file is dropped or selected using input field
  // callback function: function called as the argument to another function
  // args: acceptedFiles which is a list of accepted files
  //          rejFiles --> list of fileRejection which contains the file and the error of why it is rejecte
  const onDrop = useCallback((acceptedFiles: File[], rejFiles: FileRejection[]) => {
    // mapping each file in the accepted files list to the structure of the UploadableFile interface
    const mappedAcc = acceptedFiles.map(file => ({
      id: generateFileId(), // generate the id
      file,
      errors: [],
      progress: 0,
      remaining: 0,
      cancelTokenSource: null
    }));

    // updating the files state to include the newly accepted files
// this takes prev (previous state and files) and groups them with the newly accepted files and rejected files
// the rejected files are also mapped to the interface to showcase their errors
setFiles(prev => [
  ...prev, // Spread operator to include the previous files
  ...mappedAcc, // Spread operator to include the newly accepted files
  ...rejFiles.map(file => ({ // Mapping rejected files to the desired interface structure
    id: generateFileId(),
    file: file.file,
    errors: file.errors,
    progress: 0,
    remaining: 0,
    cancelTokenSource: null
  }))
]);
  // looping throught each accepted file and keeping stored the index we're currently at
    mappedAcc.forEach((uploadableFile, index) => {
      // destructuring the file and id attributes from the uploadable file interface
      const { file, id } = uploadableFile;
      const chunkSize = 1024000; // Chunk size in bytes (e.g., 1MB)
      const chunks = Math.ceil(file.size / chunkSize); // Calculate the total number of chunks
      let uploadedChunks = 0; // Counter for uploaded chunks

      // function to upload the chunk
      const uploadNextChunk = (chunkIndex: number) => {
        // logic that specifies where the chunk starts and ends
        const from = chunkIndex * chunkSize;
        const to = Math.min(from + chunkSize, file.size);
        const chunk = file.slice(from, to);
        const chunkFilename = `${file.name}_${chunkIndex}`; // Append chunk index to filename

        // send chunk data to FormData object so we can send it to server
        const formData = new FormData();
        formData.append('file', chunk, chunkFilename);

        // post request to node server using axios
        // the data sent is the formdata object accompanied with multiple headers such as chunk index, original file name etc.
        axios.post('http://localhost:4000/fileUpload', formData, {
            headers: {
              'X-Total-Chunks': chunks.toString(),
              'X-Chunk-Index': chunkIndex.toString(),
              'X-Original-Filename': file.name
            },
            // callback function that tracks upload progress
            // takes as argument the event that was triggered
            onUploadProgress: event => {
              // calculate progress
              const totalProgress = ((uploadedChunks + (event.loaded / event.total)) / chunks) * 100;
              // ceil the progress so that there are no decimals
              let progress = Math.ceil(totalProgress);
              // modifying the current state to hold the current progress and the remaining time and returns the updatedFiles
              setFiles(prev => {
                const updatedFiles = [...prev];
                const fileIndex = updatedFiles.findIndex(item => item.id === id);
                updatedFiles[fileIndex].progress = progress;
                updatedFiles[fileIndex].remaining = getRemainingTime(progress, uploadStartTime);
                return updatedFiles;
              });
            }
          }) // after executing the calback function, we increment the uploadedChunks counter
          .then(response => {
            uploadedChunks++;
            
            // if the chunk index is still smaller to the total chunk number, upload the next chunk
            // calling the uploadNextChunk recursively until all chunks are uploaded
            if (chunkIndex < chunks - 1) {
              uploadNextChunk(chunkIndex + 1);
            } else { // if all chunks are uploaded, set progress to 100 and time to 0
              setFiles(prev => {
                const updatedFiles = [...prev];
                const fileIndex = updatedFiles.findIndex(item => item.id === id);
                updatedFiles[fileIndex].progress = 100;
                updatedFiles[fileIndex].remaining = 0;
                return updatedFiles;
              });
            }
          })
          .catch(error => { // if any errors have been catched during upload of file, set progress and time to 0
            setFiles(prev => {
              const updatedFiles = [...prev];
              const fileIndex = updatedFiles.findIndex(item => item.id === id);
              updatedFiles[fileIndex].progress = 0;
              updatedFiles[fileIndex].remaining = 0;
              return updatedFiles;
            });
            console.log('Error uploading file:', error);
          });
      };
      // calling the upload next chunk function for the first chunk
      uploadNextChunk(0);
    });
  }, []);

  // destructuring getRootProps, getInputProps, isDragActive from the useDropzone method
  // getRootProps --> handles drag n drop
  // getInputProps --> handles input file upload
  // isDragActive --> specifies if drag is active or not
  // onDrop is a callback function to the useDropzone function, it is triggered when files are selected or dropped
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="dropzone_container">
    <div className="container">
      <div className="box">
        <div className="left">
          {/* Drag and drop or browse component */}
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <p>Drag and Drop file</p>
            <p>Or</p>
            <button id="browse_btn">Browse</button>
          </div>
        </div>
        <div className="right">
          {/* File uploaded scrollable component */}
          {files.map(file => (
            <Space direction="vertical" key={file.id} id = 'uploaded_section'>
              <Space>
                <FileOutlined className="custom-file-icon" />
                <Typography>{file.file.name}</Typography>
                {file.remaining !== 0 && <Typography>{file.remaining}s</Typography>}
              </Space>
              <Progress percent={file.progress} />
            </Space>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
  
}

export default Dropzone;

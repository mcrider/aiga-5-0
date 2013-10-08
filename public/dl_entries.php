<?php

// Read JSON from file into array
$jsonData = json_decode(file_get_contents('entries.json'));

// Iterate over array and for each project, create folder based on last name text file with metadata
foreach ($jsonData as $entry) {
  $projectPath = 'entry_files/' . slugify($entry->contact_name) . '/' . slugify($entry->project_name);
  if (!file_exists($projectPath)) {
    mkdir($projectPath, 0777, true);
  }

  $contents = (empty($entry->id) ? "" : "ID : $entry->id \n") .
              (empty($entry->project_name) ? "" : "Project Name : $entry->project_name \n") .
              (empty($entry->client_name) ? "" : "Client Name : $entry->client_name \n") .
              (empty($entry->contact_name) ? "" : "Submitter's Name : $entry->contact_name \n") .
              (empty($entry->email) ? "" : "Submitter's Email : $entry->email \n") .
              (empty($entry->phone) ? "" : "Submitter's Agency : $entry->phone \n") .
              (empty($entry->agency_name) ? "" : "Submitter's Agency : $entry->agency_name \n") .
              (empty($entry->aiga_id) ? "" : "Submitter's AIGA ID : $entry->aiga_id \n") .
              (empty($entry->url) ? "" : "URL/Paper Company : $entry->url \n") .
              (empty($entry->art_director) ? "" : "Art Director : $entry->art_director \n") .
              (empty($entry->designer) ? "" : "Designer : $entry->designer \n") .
              (empty($entry->illustrator) ? "" : "Illustrator : $entry->illustrator \n") .
              (empty($entry->copywriter) ? "" : "Copywriter : $entry->copywriter \n") .
              (empty($entry->photographer) ? "" : "Photographer : $entry->photographer \n") .
              (empty($entry->special_consultant) ? "" : "Special Consultant : $entry->special_consultant \n") .
              (empty($entry->paper) ? "" : "Paper : $entry->paper \n") .
              (empty($entry->developer) ? "" : "Developer : $entry->developer \n") .
              (empty($entry->animator) ? "" : "Animator : $entry->animator \n") .
              (empty($entry->tech_info) ? "" : "Technical information : $entry->tech_info \n") .
              (empty($entry->project_description) ? "" : "Project Description : $entry->project_description \n") .
              (empty($entry->notes) ? "" : "Notes : $entry->notes \n");

  $f = fopen ($projectPath.'/entry_info.txt', 'w');
  fputs ($f, $contents);
  fclose ($f);

  // Download each file into same folder (unless file exists)

  if(!empty($entry->files)) {
    foreach ($entry->files as $file) {
      if(file_exists($projectPath . '/' . $file->filename)) {
        error_log('Skipped ' . $file->filename);
        continue;
      }

      $url = $file->url;
      $path = $projectPath . '/' . $file->filename;

      $fp = fopen($path, 'w');
      $ch = curl_init($url);
      curl_setopt($ch, CURLOPT_FILE, $fp);
      $data = curl_exec($ch);
      curl_close($ch);
      fclose($fp);


      error_log('Saved ' . $projectPath . '/' . $file->filename);

      sleep(1);
    }
  }

}



function slugify($text)
{
  // replace non letter or digits by -
  $text = preg_replace('~[^\\pL\d]+~u', '-', $text);

  // trim
  $text = trim($text, '-');

  // transliterate
  $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

  // lowercase
  $text = strtolower($text);

  // remove unwanted characters
  $text = preg_replace('~[^-\w]+~', '', $text);

  if (empty($text))
  {
    return 'n-a';
  }

  return $text;
}
?>